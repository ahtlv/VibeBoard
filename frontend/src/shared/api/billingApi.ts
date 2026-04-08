import { apiClient } from './client'
import type { Subscription } from '@/entities/subscription/types'
import type { Plan } from '@/shared/types/plan'

// ── request DTOs ──────────────────────────────────────────────────────────────

export interface CreateCheckoutSessionRequest {
  plan: Exclude<Plan, 'free'>
  /** URL to redirect after successful payment */
  successUrl: string
  /** URL to redirect if user cancels checkout */
  cancelUrl: string
}

// ── response DTOs ─────────────────────────────────────────────────────────────

export interface CheckoutSession {
  /** Stripe Checkout Session URL — redirect user here */
  url: string
}

export interface BillingPortalSession {
  /** Stripe Billing Portal URL — redirect user here */
  url: string
}

// ── api ───────────────────────────────────────────────────────────────────────

export const billingApi = {
  /** GET /billing/subscription — текущая подписка пользователя */
  getSubscription: (): Promise<Subscription> =>
    apiClient.get<Subscription>('/billing/subscription'),

  /** POST /billing/checkout — создать Stripe Checkout Session для апгрейда */
  createCheckoutSession: (body: CreateCheckoutSessionRequest): Promise<CheckoutSession> =>
    apiClient.post<CheckoutSession>('/billing/checkout', {
      plan: body.plan,
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
    }),

  /** POST /billing/portal — получить ссылку на Stripe Billing Portal */
  getBillingPortalUrl: (returnUrl: string): Promise<BillingPortalSession> =>
    apiClient.post<BillingPortalSession>('/billing/portal', { return_url: returnUrl }),
}
