import { AppShell } from '@/shared/ui/AppShell'
import { MOCK_BOARD } from '@/shared/lib/mock/board'

// ── derive mock stats from board data ────────────────────────────────────────

function buildStats() {
  const allTasks = MOCK_BOARD.columns.flatMap((col) => col.tasks)
  const completedTasks = allTasks.filter((t) => t.status === 'done').length
  const totalTrackedSeconds = allTasks.reduce((sum, t) => sum + t.totalTrackedSeconds, 0)
  const pomodoroSessions = allTasks.reduce((sum, t) => sum + t.pomodoroSessionsCount, 0)

  const h = Math.floor(totalTrackedSeconds / 3600)
  const m = Math.floor((totalTrackedSeconds % 3600) / 60)
  const trackedTime = totalTrackedSeconds > 0 ? `${h}h ${m}m` : '0h 0m'

  return { completedTasks, trackedTime, pomodoroSessions, streak: 4 }
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

// ── component ─────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const stats = buildStats()

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Your productivity overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completed tasks"
          value={stats.completedTasks}
          description="Tasks marked as done"
          accent="text-indigo-600 dark:text-indigo-400"
          icon="✅"
        />
        <StatCard
          label="Tracked time"
          value={stats.trackedTime}
          description="Total time logged"
          accent="text-emerald-600 dark:text-emerald-400"
          icon="⏱"
        />
        <StatCard
          label="Current streak"
          value={`${stats.streak} days`}
          description="Consecutive active days"
          accent="text-orange-500 dark:text-orange-400"
          icon="🔥"
        />
        <StatCard
          label="Pomodoro sessions"
          value={stats.pomodoroSessions}
          description="Focus sessions completed"
          accent="text-red-500 dark:text-red-400"
          icon="🍅"
        />
      </div>

      {/* Pro upsell placeholder */}
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Advanced analytics — charts, trends, board breakdowns
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Available on Pro and Team plans
        </p>
        <button className="mt-3 rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Upgrade to Pro
        </button>
      </div>
    </AppShell>
  )
}
