import type { DragEvent } from 'react'
import type { Task } from '@/entities/task/types'
import type { BoardMember } from '@/entities/board/types'
import type { Priority } from '@/shared/types/task'
import { getTaskColorClasses } from '@/entities/task/taskColors'

interface TaskCardProps {
  task: Task
  members: BoardMember[]
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const AVATAR_BG = [
  'bg-indigo-500', 'bg-rose-500', 'bg-amber-500',
  'bg-teal-500', 'bg-violet-500', 'bg-sky-500', 'bg-pink-500',
]

function avatarBg(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  return AVATAR_BG[hash % AVATAR_BG.length]
}

export function TaskCard({ task, members, onClick, onDragStart }: TaskCardProps) {
  const checklistProgress = getChecklistProgress(task)
  const trackedTime = formatTrackedTime(task.totalTrackedSeconds)
  const dueDate = task.dueDate ? formatDueDate(task.dueDate) : null
  const colorClasses = getTaskColorClasses(task.bgColor)

  const assignees = members.filter((m) => task.assigneeIds.includes(m.userId))
  const visibleAssignees = assignees.slice(0, 3)
  const overflow = assignees.length - visibleAssignees.length

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'rounded-lg border px-3 py-2.5 shadow-sm',
        colorClasses,
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
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_BADGE[task.priority]}`}>
          {task.priority}
        </span>

        {/* Due date */}
        {dueDate && (
          <span className={`text-xs ${dueDate.overdue ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {dueDate.overdue ? '⚠ ' : ''}{dueDate.label}
          </span>
        )}

        {/* Checklist progress */}
        {checklistProgress && (
          <span className={`text-xs ${checklistProgress.completed === checklistProgress.total ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
            ✓ {checklistProgress.completed}/{checklistProgress.total}
          </span>
        )}

        {/* Tracked time */}
        {trackedTime && (
          <span className="text-xs text-gray-400 dark:text-gray-500">⏱ {trackedTime}</span>
        )}
      </div>

      {/* Assignees */}
      {assignees.length > 0 && (
        <div className="mt-2.5 flex items-center gap-0.5">
          {visibleAssignees.map((member) => (
            member.avatarUrl ? (
              <img
                key={member.userId}
                src={member.avatarUrl}
                alt={member.name}
                title={member.name}
                className="-ml-0 first:ml-0 h-5 w-5 rounded-full border border-white dark:border-gray-700 object-cover ring-1 ring-white dark:ring-gray-800"
              />
            ) : (
              <div
                key={member.userId}
                title={member.name}
                className={`flex h-5 w-5 items-center justify-center rounded-full border border-white dark:border-gray-700 text-[9px] font-bold text-white ring-1 ring-white dark:ring-gray-800 ${avatarBg(member.userId)}`}
              >
                {getInitials(member.name)}
              </div>
            )
          ))}
          {overflow > 0 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-[9px] font-bold text-gray-600 dark:text-gray-300 border border-white dark:border-gray-700">
              +{overflow}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
