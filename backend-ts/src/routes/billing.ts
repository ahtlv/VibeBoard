import { Hono } from 'hono'
import { z } from 'zod'
import Stripe from 'stripe'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

export const billingRouter = new Hono<AppEnv>()

function getStripe(secretKey: string) {
  return new Stripe(secretKey)
}

// GET /api/v1/billing/subscription
billingRouter.get('/subscription', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data ?? { plan: 'free', status: 'active' })
})

// POST /api/v1/billing/checkout
const checkoutSchema = z.object({
  price_id: z.string().min(1),
})

billingRouter.post('/checkout', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const user = c.get('user')
  const supabase = getSupabase(c.env)
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY)

  const body = await c.req.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  // Ищем существующего Stripe customer
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()

  let customerId = sub?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { user_id: userId },
    })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: parsed.data.price_id, quantity: 1 }],
    success_url: `${c.env.FRONTEND_URL}/billing?success=true`,
    cancel_url: `${c.env.FRONTEND_URL}/billing?canceled=true`,
    metadata: { user_id: userId },
  })

  return c.json({ url: session.url })
})

// POST /api/v1/billing/portal
billingRouter.post('/portal', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY)

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return c.json({ error: 'No Stripe customer found. Subscribe first.' }, 404)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${c.env.FRONTEND_URL}/billing`,
  })

  return c.json({ url: session.url })
})

// POST /api/v1/billing/webhook
billingRouter.post('/webhook', async (c) => {
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY)
  const supabase = getSupabase(c.env)

  const body = await c.req.text()
  const sig = c.req.header('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return c.json({ error: 'Invalid webhook signature' }, 400)
  }

  const sub = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const userId = sub.metadata?.user_id
      if (!userId) break

      const plan = sub.items.data[0]?.price?.lookup_key ?? 'pro'

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: sub.status,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' })

      await supabase.from('users').update({ plan }).eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const userId = sub.metadata?.user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)

      await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
      break
    }
  }

  return c.json({ received: true })
})
