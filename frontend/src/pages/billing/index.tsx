import { AppShell } from '@/shared/ui/AppShell'
import { useAuth } from '@/features/auth/store'
import type { Plan } from '@/shared/types/plan'

// ── plan config ───────────────────────────────────────────────────────────────

interface PlanConfig {
  id: Plan
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'For individuals getting started',
    features: [
      'Up to 3 boards',
      'Basic kanban',
      'Pomodoro timer',
      'Time tracking',
    ],
    cta: 'Current plan',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    description: 'For power users',
    features: [
      'Unlimited boards',
      'Recurring tasks',
      'Advanced analytics',
      'Export (CSV / PDF)',
      'Premium themes',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$19',
    description: 'For teams and collaboration',
    features: [
      'Everything in Pro',
      'Workspace collaboration',
      'Member roles (owner / admin / member)',
      'Team analytics',
      'Invitations',
    ],
    cta: 'Upgrade to Team',
    highlighted: false,
  },
]

// ── component ─────────────────────────────────────────────────────────────────

export function BillingPage() {
  const { user } = useAuth()
  const currentPlan = user?.plan ?? 'free'

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Manage your subscription and billing
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Current plan banner */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Current plan
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {currentPlan}
              </span>
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                Active
              </span>
            </div>
          </div>
          {/* TODO: подключить billingApi.createPortalSession() */}
          <button
            onClick={() => console.log('TODO: Stripe billing portal')}
            className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Manage billing
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentPlan)

            return (
              <div
                key={plan.id}
                className={[
                  'relative flex flex-col rounded-xl border p-6',
                  plan.highlighted
                    ? 'border-indigo-500 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
                ].join(' ')}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                    Popular
                  </span>
                )}

                {/* Plan header */}
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h2>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.price}
                    </span>
                    {plan.id !== 'free' && (
                      <span className="text-sm text-gray-400 dark:text-gray-500">/mo</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="mt-0.5 text-indigo-500 dark:text-indigo-400 shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                    Current plan
                  </div>
                ) : isDowngrade ? (
                  // TODO: подключить billingApi.createPortalSession()
                  <button
                    onClick={() => console.log('TODO: downgrade via billing portal')}
                    className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Downgrade
                  </button>
                ) : (
                  // TODO: подключить billingApi.createCheckoutSession({ plan: plan.id })
                  <button
                    onClick={() => console.log(`TODO: checkout for ${plan.id}`)}
                    className={[
                      'rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
                      plan.highlighted
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
                    ].join(' ')}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Billing note */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Payments are processed securely by Stripe. You can cancel or change your plan at any time
          from the billing portal.
        </p>
      </div>
    </AppShell>
  )
}
