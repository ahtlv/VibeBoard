import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/shared/ui/AppShell'
import { TaskCard } from '@/widgets'
import { ActivityHeatmap } from '@/widgets/ActivityHeatmap'
import { workspacesApi } from '@/shared/api'
import { tasksApi, mapTask } from '@/shared/api/tasksApi'
import type { Task } from '@/entities/task/types'

// ── date helpers ──────────────────────────────────────────────────────────────

function toDateKey(iso: string): string { return iso.slice(0, 10) }
function todayKey(): string { return toDateKey(new Date().toISOString()) }
function tomorrowKey(): string {
  const d = new Date(); d.setDate(d.getDate() + 1); return toDateKey(d.toISOString())
}

interface TaskGroup { dateKey: string; label: string; overdue: boolean; tasks: Task[] }

function groupByDate(
  tasks: Task[],
  dateField: (t: Task) => string | null,
  labels: { today: string; tomorrow: string; overdue: string },
  lng: string,
) {
  const map = new Map<string, Task[]>()
  const noDate: Task[] = []
  const today = todayKey()
  const tomorrow = tomorrowKey()

  for (const task of tasks) {
    const raw = dateField(task)
    if (!raw) { noDate.push(task); continue }
    const key = toDateKey(raw)
    map.set(key, [...(map.get(key) ?? []), task])
  }

  const groups: TaskGroup[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, groupTasks]) => {
      let label: string
      let overdue = false
      if (dateKey < today) { label = labels.overdue; overdue = true }
      else if (dateKey === today) { label = labels.today }
      else if (dateKey === tomorrow) { label = labels.tomorrow }
      else {
        const d = new Date(dateKey + 'T00:00:00')
        label = d.toLocaleDateString(lng, { weekday: 'short', month: 'short', day: 'numeric' })
      }
      return { dateKey, tasks: groupTasks, label, overdue }
    })

  return { groups, noDate }
}

// ── component ─────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const { t, i18n } = useTranslation()
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const wss = await workspacesApi.listWorkspaces()
        if (cancelled || wss.length === 0) return
        const wsId = wss[0].id

        const [upcoming, completed, heatmap] = await Promise.allSettled([
          tasksApi.getUpcoming(wsId),
          tasksApi.getCompleted(wsId),
          tasksApi.getHeatmap(wsId),
        ])

        if (cancelled) return
        if (upcoming.status === 'fulfilled') setUpcomingTasks(upcoming.value.map(mapTask))
        if (completed.status === 'fulfilled') setCompletedTasks(completed.value.map(mapTask))
        if (heatmap.status === 'fulfilled') setHeatmapData(heatmap.value)
      } catch { /* workspace load failed */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const dateLabels = {
    today: t('calendar.today'),
    tomorrow: t('calendar.tomorrow'),
    overdue: t('calendar.overdue'),
  }

  const { groups: upcomingGroups, noDate } = groupByDate(
    upcomingTasks,
    (t) => t.dueDate,
    dateLabels,
    i18n.language,
  )

  const { groups: completedGroups } = groupByDate(
    completedTasks,
    (t) => t.completedAt,
    dateLabels,
    i18n.language,
  )

  const totalCompleted = heatmapData.reduce((s, d) => s + d.count, 0)

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('calendar.title')}</h1>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="animate-spin">⏳</span> {t('common.loading')}
        </div>
      ) : (
        <div className="max-w-3xl space-y-10">

          {/* ── Activity Heatmap ── */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <ActivityHeatmap data={heatmapData} totalCompleted={totalCompleted} />
          </section>

          {/* ── Upcoming tasks ── */}
          {(upcomingGroups.length > 0 || noDate.length > 0) && (
            <section>
              <SectionHeader label={t('calendar.upcoming')} />
              <div className="mt-4 space-y-8">
                {upcomingGroups.map((group) => (
                  <DateGroup key={group.dateKey} group={group} />
                ))}
                {noDate.length > 0 && (
                  <DateGroup
                    group={{ dateKey: 'nodate', label: t('calendar.noDateTasks'), overdue: false, tasks: noDate }}
                  />
                )}
              </div>
            </section>
          )}

          {/* ── Completed tasks ── */}
          {completedGroups.length > 0 && (
            <section>
              <SectionHeader label={t('calendar.completed')} accent="green" />
              <div className="mt-4 space-y-6">
                {completedGroups.map((group) => (
                  <DateGroup key={group.dateKey} group={group} completed />
                ))}
              </div>
            </section>
          )}

          {completedGroups.length === 0 && upcomingGroups.length === 0 && noDate.length === 0 && (
            <EmptyState />
          )}
        </div>
      )}
    </AppShell>
  )
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, accent }: { label: string; accent?: 'green' }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-gray-800">
      <h2 className={[
        'text-sm font-semibold uppercase tracking-wide',
        accent === 'green' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
      ].join(' ')}>
        {accent === 'green' && '✓ '}{label}
      </h2>
    </div>
  )
}

function DateGroup({ group, completed }: { group: TaskGroup; completed?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h3 className={[
          'text-xs font-semibold uppercase tracking-wide',
          group.overdue && !completed ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500',
        ].join(' ')}>
          {group.label}
        </h3>
        <span className={[
          'rounded-full px-2 py-0.5 text-xs font-medium',
          completed
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : group.overdue
            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        ].join(' ')}>
          {group.tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {group.tasks.map((task) => (
          <div key={task.id} className={completed ? 'opacity-70' : undefined}>
            <TaskCard task={task} members={[]} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-2xl select-none">
        📅
      </div>
      <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{t('calendar.noTasks')}</p>
      <p className="mt-1 text-xs text-gray-400">{t('calendar.noTasksHint')}</p>
    </div>
  )
}
