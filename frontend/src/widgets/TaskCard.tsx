import type { DragEvent } from 'react'
import type { Task } from '@/entities/task/types'
import type { Priority } from '@/shared/types/task'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void
}

const PRIORITY_BADGE: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

function formatDueDate(iso: string): { label: string; overdue: boolean } {
  const date = new Date(iso)
  const now = new Date()
  const overdue = date < now
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return { label, overdue }
}

function formatTrackedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return ''
}

function getChecklistProgress(task: Task): { completed: number; total: number } | null {
  const total = task.checklists.reduce((sum, cl) => sum + cl.items.length, 0)
  if (total === 0) return null
  const completed = task.checklists.reduce(
    (sum, cl) => sum + cl.items.filter((i) => i.completed).length,
    0,
  )
  return { completed, total }
}

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const checklistProgress = getChecklistProgress(task)
  const trackedTime = formatTrackedTime(task.totalTrackedSeconds)
  const dueDate = task.dueDate ? formatDueDate(task.dueDate) : null

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        'px-3 py-2.5 shadow-sm',
        onDragStart ? 'cursor-grab active:cursor-grabbing active:opacity-50' : '',
        onClick ? 'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all' : '',
      ].join(' ')}
    >
      {/* Title */}
      <p className="text-sm text-gray-900 dark:text-gray-100 leading-snug">{task.title}</p>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Priority */}
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_BADGE[task.priority]}`}
        >
          {task.priority}
        </span>

        {/* Due date */}
        {dueDate && (
          <span
            className={`text-xs ${dueDate.overdue ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {dueDate.overdue ? '⚠ ' : ''}{dueDate.label}
          </span>
        )}

        {/* Checklist progress */}
        {checklistProgress && (
          <span
            className={`text-xs ${checklistProgress.completed === checklistProgress.total ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            ✓ {checklistProgress.completed}/{checklistProgress.total}
          </span>
        )}

        {/* Tracked time */}
        {trackedTime && (
          <span className="text-xs text-gray-400 dark:text-gray-500">⏱ {trackedTime}</span>
        )}
      </div>
    </div>
  )
}
