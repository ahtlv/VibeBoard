import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/shared/ui/AppShell'
import { PremiumGate } from '@/shared/ui/PremiumGate'
import { analyticsApi, AnalyticsOverview } from '@/shared/api/analyticsApi'
import { useAuth } from '@/features/auth/store'

// ── helpers ───────────────────────────────────────────────────────────────────

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m`
}

// ── stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  description: string
  accent: string
  icon: string
}

function StatCard({ label, value, description, accent, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

// ── types ─────────────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'error' | 'ready'

// ── component ─────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const isPro = user?.plan === 'pro' || user?.plan === 'team'
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadState('loading')
      try {
        const data = await analyticsApi.getOverview()
        if (cancelled) return
        setOverview(data)
        setLoadState('ready')
      } catch {
        if (!cancelled) setLoadState('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  if (loadState === 'error') {
    return (
      <AppShell>
        <p className="text-sm text-red-500">{t('analytics.error')}</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('analytics.title')}</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loadState === 'loading' ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-4 h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mb-2 h-9 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label={t('analytics.tasks')}
              value={overview!.completedTasks}
              description={t('analytics.tasks')}
              accent="text-indigo-600 dark:text-indigo-400"
              icon="✅"
            />
            <StatCard
              label={t('analytics.time')}
              value={formatSeconds(overview!.totalTrackedSeconds)}
              description={t('analytics.time')}
              accent="text-emerald-600 dark:text-emerald-400"
              icon="⏱"
            />
            <StatCard
              label={t('analytics.streak')}
              value={`${overview!.currentStreakDays}`}
              description={t('analytics.streak')}
              accent="text-orange-500 dark:text-orange-400"
              icon="🔥"
            />
            <StatCard
              label={t('analytics.pomodoros')}
              value={overview!.pomodoroSessionsCount}
              description={t('analytics.pomodoros')}
              accent="text-red-500 dark:text-red-400"
              icon="🍅"
            />
          </>
        )}
      </div>

      {/* Advanced analytics */}
      <div className="mt-8">
        {isPro ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Charts, trends, board breakdowns — coming soon
            </p>
          </div>
        ) : (
          <PremiumGate
            feature="Advanced analytics"
            description="Charts, daily trends, board breakdowns, and completion rate — available on Pro and Team plans."
          />
        )}
      </div>
    </AppShell>
  )
}
