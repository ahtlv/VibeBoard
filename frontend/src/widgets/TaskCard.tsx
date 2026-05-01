import type { DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Task } from '@/entities/task/types'
import type { BoardMember } from '@/entities/board/types'
import type { Priority } from '@/shared/types/task'
import { getTaskColorClasses } from '@/entities/task/taskColors'

interface TaskCardProps {
  task: Task
  members: BoardMember[]
  onClick?: () => void
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void
  currentUserId?: string
  isAdmin?: boolean
  onSubmitReview?: (taskId: string) => void
  onApprove?: (taskId: string) => void
  onReject?: (taskId: string) => void
}

const PRIORITY_BADGE: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

function formatDueDate(iso: string, lng: string): { label: string; overdue: boolean } {
  const date = new Date(iso)
  const now = new Date()
  const overdue = date < now
  const label = date.toLocaleDateString(lng, { month: 'short', day: 'numeric' })
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

export function TaskCard({ task, members, onClick, onDragStart, currentUserId, isAdmin, onSubmitReview, onApprove, onReject }: TaskCardProps) {
  const { t, i18n } = useTranslation()
  const checklistProgress = getChecklistProgress(task)
  const trackedTime = formatTrackedTime(task.totalTrackedSeconds)
  const dueDate = task.dueDate ? formatDueDate(task.dueDate, i18n.language) : null
  const colorClasses = getTaskColorClasses(task.bgColor)

  const assignees = members.filter((m) => task.assigneeIds.includes(m.userId))
  const visibleAssignees = assignees.slice(0, 3)
  const overflow = assignees.length - visibleAssignees.length

  const priorityKey = `task.priority${task.priority.charAt(0).toUpperCase()}${task.priority.slice(1)}` as const

  const isInReview = task.status === 'in_review'
  const isExecutor = currentUserId === task.assigneeIds[0] || currentUserId !== undefined
  const canSubmit = isExecutor && (task.status === 'todo' || task.status === 'in_progress') && !!onSubmitReview
  const canApprove = isAdmin && isInReview && !!onApprove
  const canReject = isAdmin && isInReview && !!onReject

  return (
    <div
      draggable={!!onDragStart && !isInReview}
      onDragStart={onDragStart}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'relative rounded-lg border px-3 py-2.5 shadow-sm',
        isInReview ? 'border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : colorClasses,
        onDragStart && !isInReview ? 'cursor-grab active:cursor-grabbing active:opacity-50' : '',
        onClick ? 'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all' : '',
      ].join(' ')}
    >
      {/* Submit button — top-right corner, checkmark only */}
      {canSubmit && (
        <button
          onClick={(e) => { e.stopPropagation(); onSubmitReview!(task.id) }}
          title={t('task.submitReview')}
          aria-label={t('task.submitReview')}
          className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs transition-colors"
        >
          ✓
        </button>
      )}

      {/* In Review badge */}
      {isInReview && (
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
            <span>👁</span> {t('task.inReview')}
          </span>
        </div>
      )}

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

      {/* Meta row: priority + meta left, assignees right */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* Priority */}
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}>
            {t(priorityKey)}
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
          <div className="flex shrink-0 items-center">
            {visibleAssignees.map((member) => (
              member.avatarUrl ? (
                <img
                  key={member.userId}
                  src={member.avatarUrl}
                  alt={member.name}
                  title={member.name}
                  className="-ml-1 first:ml-0 h-5 w-5 rounded-full border border-white dark:border-gray-700 object-cover ring-1 ring-white dark:ring-gray-800"
                />
              ) : (
                <div
                  key={member.userId}
                  title={member.name}
                  className={`-ml-1 first:ml-0 flex h-5 w-5 items-center justify-center rounded-full border border-white dark:border-gray-700 text-[9px] font-bold text-white ring-1 ring-white dark:ring-gray-800 ${avatarBg(member.userId)}`}
                >
                  {getInitials(member.name)}
                </div>
              )
            ))}
            {overflow > 0 && (
              <div className="-ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-[9px] font-bold text-gray-600 dark:text-gray-300 border border-white dark:border-gray-700">
                +{overflow}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Admin approve/reject buttons */}
      {(canApprove || canReject) && (
        <div
          className="mt-2 flex gap-1.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {canApprove && (
            <button
              onClick={() => onApprove!(task.id)}
              className="flex-1 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-2 py-1 text-[11px] font-semibold text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              ✓ {t('task.approve')}
            </button>
          )}
          {canReject && (
            <button
              onClick={() => onReject!(task.id)}
              className="flex-1 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-1 text-[11px] font-semibold text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              ✗ {t('task.reject')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
