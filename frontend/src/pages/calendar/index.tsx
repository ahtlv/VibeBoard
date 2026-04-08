import { useState } from 'react'
import { AppShell } from '@/shared/ui/AppShell'
import { TaskCard, TaskModal } from '@/widgets'
import { MOCK_BOARD } from '@/shared/lib/mock/board'
import type { Task } from '@/entities/task/types'

// ── date helpers ──────────────────────────────────────────────────────────────

function toDateKey(iso: string): string {
  return iso.slice(0, 10) // "YYYY-MM-DD"
}

function todayKey(): string {
  return toDateKey(new Date().toISOString())
}

function tomorrowKey(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateKey(d.toISOString())
}

function groupLabel(dateKey: string): { label: string; overdue: boolean } {
  const today = todayKey()
  const tomorrow = tomorrowKey()
  if (dateKey < today) return { label: 'Overdue', overdue: true }
  if (dateKey === today) return { label: 'Today', overdue: false }
  if (dateKey === tomorrow) return { label: 'Tomorrow', overdue: false }
  const date = new Date(dateKey + 'T00:00:00')
  return {
    label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    overdue: false,
  }
}

// ── grouping ──────────────────────────────────────────────────────────────────

interface TaskGroup {
  dateKey: string
  label: string
  overdue: boolean
  tasks: Task[]
}

function groupTasksByDate(tasks: Task[]): { groups: TaskGroup[]; noDate: Task[] } {
  const map = new Map<string, Task[]>()
  const noDate: Task[] = []

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
    .map(([dateKey, tasks]) => ({ dateKey, tasks, ...groupLabel(dateKey) }))

  return { groups, noDate }
}

// ── component ─────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const allTasks = MOCK_BOARD.columns.flatMap((col) => col.tasks)
  const { groups, noDate } = groupTasksByDate(allTasks)
  const tasksWithDate = allTasks.filter((t) => t.dueDate !== null).length

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Calendar</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {tasksWithDate} task{tasksWithDate !== 1 ? 's' : ''} with deadlines
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
                <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
              ))}
            </div>
          </section>
        ))}

        {/* No due date */}
        {noDate.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                No due date
              </h2>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                {noDate.length}
              </span>
            </div>
            <div className="space-y-2">
              {noDate.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
              ))}
            </div>
          </section>
        )}

        {groups.length === 0 && noDate.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">No tasks yet.</p>
        )}
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </AppShell>
  )
}
