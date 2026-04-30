import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/shared/ui/AppShell'
import { useAuth } from '@/features/auth/store'
import { billingApi } from '@/shared/api/billingApi'
import type { Subscription } from '@/entities/subscription/types'
import type { BillingStatus, Plan } from '@/shared/types/plan'

// ── plan config ───────────────────────────────────────────────────────────────

interface PlanConfig {
  id: Plan
  name: string
  price: string
  descKey: string
  featureKeys: string[]
  ctaKey: string
  highlighted: boolean
}

const PLAN_DEFS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    descKey: 'billing.freeDesc',
    featureKeys: ['billing.freeFeature1', 'billing.freeFeature2', 'billing.freeFeature3', 'billing.freeFeature4'],
    ctaKey: 'billing.currentPlanCta',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    descKey: 'billing.proDesc',
    featureKeys: ['billing.proFeature1', 'billing.proFeature2', 'billing.proFeature3', 'billing.proFeature4', 'billing.proFeature5'],
    ctaKey: 'billing.upgradePro',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$19',
    descKey: 'billing.teamDesc',
    featureKeys: ['billing.teamFeature1', 'billing.teamFeature2', 'billing.teamFeature3', 'billing.teamFeature4', 'billing.teamFeature5'],
    ctaKey: 'billing.upgradeTeam',
    highlighted: false,
  },
]

const PLAN_ORDER: Plan[] = ['free', 'pro', 'team']

// ── status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BillingStatus, string> = {
  active:   'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  trialing: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  past_due: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  canceled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  unpaid:   'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
}

const STATUS_KEY: Record<BillingStatus, string> = {
  active:   'billing.active',
  trialing: 'billing.trialing',
  past_due: 'billing.pastDue',
  canceled: 'billing.canceled',
  unpaid:   'billing.unpaid',
}

// ── types ─────────────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'error' | 'ready'

// ── component ─────────────────────────────────────────────────────────────────

export function BillingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<Plan | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const checkoutResult = new URLSearchParams(window.location.search).get('checkout')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const sub = await billingApi.getSubscription()
        if (cancelled) return
        setSubscription(sub)
        setLoadState('ready')
      } catch {
        if (!cancelled) setLoadState('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const currentPlan: Plan = subscription?.plan ?? user?.plan ?? 'free'
  const billingStatus: BillingStatus = subscription?.status ?? 'active'

  async function handleUpgrade(plan: Exclude<Plan, 'free'>) {
    setCheckoutLoading(plan)
    try {
      const successUrl = `${window.location.origin}/billing?checkout=success`
      const cancelUrl = `${window.location.origin}/billing?checkout=canceled`
      const session = await billingApi.createCheckoutSession({ plan, successUrl, cancelUrl })
      window.location.href = session.url
    } catch {
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const returnUrl = `${window.location.origin}/billing`
      const session = await billingApi.getBillingPortalUrl(returnUrl)
      window.location.href = session.url
    } catch {
      setPortalLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('billing.title')}</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {t('billing.currentPlan')}
        </p>
      </div>

      {/* Checkout result banners */}
      {checkoutResult === 'success' && (
        <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {t('billing.checkoutSuccess')}
          </p>
        </div>
      )}
      {checkoutResult === 'canceled' && (
        <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('billing.checkoutCanceled')}
          </p>
        </div>
      )}

      {loadState === 'error' && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-5 py-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('billing.error')}
          </p>
        </div>
      )}

      <div className="max-w-4xl space-y-8">
        {/* Current plan banner */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('billing.currentPlan')}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {loadState === 'loading' ? (
                <span className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              ) : (
                <>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {currentPlan}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[billingStatus]}`}>
                    {t(STATUS_KEY[billingStatus])}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handlePortal}
            disabled={portalLoading || loadState === 'loading' || currentPlan === 'free'}
            className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('billing.manage')}
          </button>
        </div>

        {/* Plan cards */}
        {loadState === 'loading' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="mb-2 h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mb-4 h-8 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" style={{ width: `${70 + j * 10}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLAN_DEFS.map((plan) => {
              const isCurrent = plan.id === currentPlan
              const isDowngrade = PLAN_ORDER.indexOf(plan.id) < PLAN_ORDER.indexOf(currentPlan)
              const isUpgrade = !isCurrent && !isDowngrade && plan.id !== 'free'
              const isLoading = checkoutLoading === plan.id

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
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t(plan.descKey)}</p>
                  </div>

                  {/* Features */}
                  <ul className="mb-6 flex-1 space-y-2">
                    {plan.featureKeys.map((key) => (
                      <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="mt-0.5 text-indigo-500 dark:text-indigo-400 shrink-0">✓</span>
                        {t(key)}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                      {t('billing.currentPlanCta')}
                    </div>
                  ) : isDowngrade ? (
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('billing.manage')}
                    </button>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.id as Exclude<Plan, 'free'>)}
                      disabled={isLoading || checkoutLoading !== null}
                      className={[
                        'rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                        plan.highlighted
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
                      ].join(' ')}
                    >
                      {isLoading ? '...' : t(plan.ctaKey)}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
