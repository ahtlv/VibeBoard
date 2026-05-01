import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { Task } from '@/entities/task/types'
import type { BoardMember } from '@/entities/board/types'

interface PendingReviewPanelProps {
  tasks: Task[]
  members: BoardMember[]
  onApprove: (taskId: string) => void
  onReject: (taskId: string) => void
  onClose: () => void
}

export function PendingReviewPanel({ tasks, members, onApprove, onReject, onClose }: PendingReviewPanelProps) {
  const { t } = useTranslation()
  const memberMap = Object.fromEntries(members.map((m) => [m.userId, m]))

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 top-14 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-sm flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <span>👁</span>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('task.inReview')}
            </h2>
            {tasks.length > 0 && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                {tasks.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Закрыть"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 pt-8">
              Нет задач на проверке
            </p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => {
                const assignees = task.assigneeIds
                  .map((id) => memberMap[id])
                  .filter(Boolean)
                return (
                  <li
                    key={task.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3"
                  >
                    <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                      {task.title}
                    </p>
                    {assignees.length > 0 && (
                      <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
                        {assignees.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(task.id)}
                        className="flex-1 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-2 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                      >
                        ✓ {t('task.approve')}
                      </button>
                      <button
                        onClick={() => onReject(task.id)}
                        className="flex-1 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        ✗ {t('task.reject')}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
