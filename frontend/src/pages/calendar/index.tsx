import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/shared/ui/AppShell'
import { TaskCard, TaskModal } from '@/widgets'
import { MOCK_BOARD } from '@/shared/lib/mock/board'
import type { Task } from '@/entities/task/types'

// ── date helpers ──────────────────────────────────────────────────────────────

function toDateKey(iso: string): string {
  return iso.slice(0, 10)
}

function todayKey(): string {
  return toDateKey(new Date().toISOString())
}

function tomorrowKey(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateKey(d.toISOString())
}

// ── grouping ──────────────────────────────────────────────────────────────────

interface TaskGroup {
  dateKey: string
  label: string
  overdue: boolean
  tasks: Task[]
}

function groupTasksByDate(
  tasks: Task[],
  todayLabel: string,
  tomorrowLabel: string,
  overdueLabel: string,
  lng: string,
): { groups: TaskGroup[]; noDate: Task[] } {
  const map = new Map<string, Task[]>()
  const noDate: Task[] = []
  const today = todayKey()
  const tomorrow = tomorrowKey()

  for (const task of tasks) {
    if (!task.dueDate) {
      noDate.push(task)
    } else {
      const key = toDateKey(task.dueDate)
      const existing = map.get(key) ?? []
      map.set(key, [...existing, task])
    }
  }

  const groups: TaskGroup[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, groupTasks]) => {
      let label: string
      let overdue = false
      if (dateKey < today) {
        label = overdueLabel
        overdue = true
      } else if (dateKey === today) {
        label = todayLabel
      } else if (dateKey === tomorrow) {
        label = tomorrowLabel
      } else {
        const date = new Date(dateKey + 'T00:00:00')
        label = date.toLocaleDateString(lng, { weekday: 'short', month: 'short', day: 'numeric' })
      }
      return { dateKey, tasks: groupTasks, label, overdue }
    })

  return { groups, noDate }
}

// ── component ─────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const { t, i18n } = useTranslation()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const allTasks = MOCK_BOARD.columns.flatMap((col) => col.tasks)
  const { groups, noDate } = groupTasksByDate(
    allTasks,
    t('calendar.today'),
    t('calendar.tomorrow'),
    t('calendar.overdue'),
    i18n.language,
  )
  const tasksWithDate = allTasks.filter((t) => t.dueDate !== null).length

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('calendar.title')}</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {tasksWithDate}
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        {groups.map((group) => (
          <section key={group.dateKey}>
            <div className="mb-3 flex items-center gap-2">
              <h2
                className={`text-xs font-semibold uppercase tracking-wide ${
                  group.overdue
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {group.label}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  group.overdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {group.tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.tasks.map((task) => (
                <TaskCard key={task.id} task={task} members={[]} onClick={() => setSelectedTask(task)} />
              ))}
            </div>
          </section>
        ))}

        {/* No due date */}
        {noDate.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('calendar.noDateTasks')}
              </h2>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                {noDate.length}
              </span>
            </div>
            <div className="space-y-2">
              {noDate.map((task) => (
                <TaskCard key={task.id} task={task} members={[]} onClick={() => setSelectedTask(task)} />
              ))}
            </div>
          </section>
        )}

        {groups.length === 0 && noDate.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-2xl select-none">
              📅
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('calendar.noTasks')}
            </p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          mode={{ kind: 'edit', task: selectedTask }}
          members={[]}
          onClose={() => setSelectedTask(null)}
          onSubmit={() => setSelectedTask(null)}
        />
      )}
    </AppShell>
  )
}
