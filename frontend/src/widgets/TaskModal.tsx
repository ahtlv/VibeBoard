import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Task } from '@/entities/task/types'
import type { Priority } from '@/shared/types/task'

interface TaskModalProps {
  task: Task
  onClose: () => void
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const PRIORITY_BADGE: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TaskModal({ task, onClose }: TaskModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    task.checklists.forEach((cl) => cl.items.forEach((item) => { if (item.completed) ids.add(item.id) }))
    return ids
  })

  const POMODORO_SECONDS = 25 * 60
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle')
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    setTimerStatus('running')
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setTimerStatus('idle')
          return POMODORO_SECONDS
        }
        return prev - 1
      })
    }, 1000)
  }

  function pauseTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerStatus('paused')
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerStatus('idle')
    setSecondsLeft(POMODORO_SECONDS)
  }

  // Очищаем интервал при закрытии модалки
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function toggleItem(itemId: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  // Закрытие по Escape
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Блокируем скролл body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleBackdropKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <h2
            id="task-modal-title"
            className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug"
          >
            {task.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="mt-0.5 shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Priority */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Priority
            </p>
            <span
              className={`inline-block rounded px-2 py-1 text-sm font-medium capitalize ${PRIORITY_BADGE[task.priority]}`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>

          {/* Due date */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Due date
            </p>
            {task.dueDate ? (
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {formatDueDate(task.dueDate)}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No due date</p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Description
            </p>
            {task.description ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No description</p>
            )}
          </div>

          {/* Pomodoro timer */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Pomodoro
            </p>
            <div className="flex items-center gap-4">
              {/* Time display */}
              <div className="flex-1">
                <p className="text-3xl font-mono font-semibold text-gray-900 dark:text-gray-100 leading-none">
                  {formatTime(secondsLeft)}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {timerStatus === 'running' && 'Focus session'}
                  {timerStatus === 'paused' && 'Paused'}
                  {timerStatus === 'idle' && 'Ready'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {timerStatus === 'idle' && (
                  <button
                    onClick={startTimer}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Start
                  </button>
                )}
                {timerStatus === 'running' && (
                  <button
                    onClick={pauseTimer}
                    className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                  >
                    Pause
                  </button>
                )}
                {timerStatus === 'paused' && (
                  <button
                    onClick={startTimer}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Resume
                  </button>
                )}
                {timerStatus !== 'idle' && (
                  <button
                    onClick={stopTimer}
                    className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Checklists */}
          {task.checklists.length > 0 && task.checklists.map((checklist) => {
            const total = checklist.items.length
            const completed = checklist.items.filter((i) => checkedItems.has(i.id)).length
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div key={checklist.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {checklist.title}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {completed} / {total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500 transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Items */}
                <ul className="space-y-2">
                  {checklist.items
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((item) => {
                      const isChecked = checkedItems.has(item.id)
                      return (
                        <li key={item.id} className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id={`item-${item.id}`}
                            checked={isChecked}
                            onChange={() => toggleItem(item.id)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`item-${item.id}`}
                            className={[
                              'text-sm cursor-pointer select-none leading-snug',
                              isChecked
                                ? 'line-through text-gray-400 dark:text-gray-500'
                                : 'text-gray-700 dark:text-gray-300',
                            ].join(' ')}
                          >
                            {item.title}
                          </label>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )
          })}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Labels
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
