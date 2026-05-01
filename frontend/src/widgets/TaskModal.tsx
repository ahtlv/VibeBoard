import { useEffect, useRef, useState, type KeyboardEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Task } from '@/entities/task/types'
import type { BoardMember } from '@/entities/board/types'
import type { Priority } from '@/shared/types/task'
import { timeEntriesApi } from '@/shared/api/timeEntriesApi'
import { PremiumGate } from '@/shared/ui/PremiumGate'
import { useAuth } from '@/features/auth/store'
import { TASK_COLORS, TASK_COLOR_DOT } from '@/entities/task/taskColors'

export type TaskModalMode =
  | { kind: 'create'; columnId: string }
  | { kind: 'edit'; task: Task }

export interface TaskFormValues {
  title: string
  description: string
  priority: Priority
  dueDate: string
  bgColor: string | null
  assigneeIds: string[]
}

interface TaskModalProps {
  mode: TaskModalMode
  members: BoardMember[]
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
  onDelete?: (taskId: string) => void
}

const PRIORITY_VALUES: Priority[] = ['low', 'medium', 'high', 'urgent']

const PRIORITY_BADGE: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
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

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function TaskModal({ mode, members, onClose, onSubmit, onDelete }: TaskModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const isPro = user?.plan === 'pro' || user?.plan === 'team'
  const isCreate = mode.kind === 'create'
  const task = mode.kind === 'edit' ? mode.task : null

  // Form state
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '')
  const [bgColor, setBgColor] = useState<string | null>(task?.bgColor ?? null)
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assigneeIds ?? [])
  const [titleError, setTitleError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!task || !onDelete) return
    setDeleting(true)
    onDelete(task.id)
  }

  // Pomodoro state (edit mode only)
  const POMODORO_SECONDS = 25 * 60
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle')
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS)
  const [timerError, setTimerError] = useState<string | null>(null)
  const [isTimerLoading, setIsTimerLoading] = useState(false)
  const activeEntryIdRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Checklist state (edit mode only)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    task?.checklists.forEach((cl) => cl.items.forEach((item) => { if (item.completed) ids.add(item.id) }))
    return ids
  })

  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isCreate) setTimeout(() => titleInputRef.current?.focus(), 50)
  }, [isCreate])

  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function handleBackdropKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') onClose()
  }

  function toggleAssignee(userId: string) {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError(t('task.titleRequired'))
      titleInputRef.current?.focus()
      return
    }
    if (trimmed.length > 200) {
      setTitleError(t('task.titleTooLong'))
      return
    }
    setTitleError('')
    onSubmit({ title: trimmed, description: description.trim(), priority, dueDate, bgColor, assigneeIds })
  }

  // Pomodoro controls
  function startCountdown() {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          if (activeEntryIdRef.current) {
            timeEntriesApi.stop().catch(() => {})
            activeEntryIdRef.current = null
          }
          setTimerStatus('idle')
          return POMODORO_SECONDS
        }
        return prev - 1
      })
    }, 1000)
  }

  async function startTimer() {
    if (!task) return
    setTimerError(null)
    setIsTimerLoading(true)
    try {
      const entry = await timeEntriesApi.start(task.id)
      activeEntryIdRef.current = entry.id
      setTimerStatus('running')
      startCountdown()
    } catch {
      setTimerError(t('task.startError'))
    } finally {
      setIsTimerLoading(false)
    }
  }

  function pauseTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerStatus('paused')
  }

  function resumeTimer() {
    setTimerStatus('running')
    startCountdown()
  }

  async function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerError(null)
    setIsTimerLoading(true)
    try {
      await timeEntriesApi.stop()
      activeEntryIdRef.current = null
    } catch {
      setTimerError(t('task.stopError'))
    } finally {
      setIsTimerLoading(false)
      setTimerStatus('idle')
      setSecondsLeft(POMODORO_SECONDS)
    }
  }

  function toggleItem(itemId: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
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
        className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-6 py-4 shrink-0">
          <h2 id="task-modal-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {isCreate ? t('task.newTask') : t('task.editTask')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('task.cancel')}
            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('task.title')} <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); if (titleError) setTitleError('') }}
              placeholder={t('task.titlePlaceholder')}
              maxLength={200}
              className={[
                'w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-1 transition-colors',
                titleError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500',
              ].join(' ')}
            />
            {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('task.description')}
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('task.descriptionPlaceholder')}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('task.priority')}
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {PRIORITY_VALUES.map((val) => (
                  <option key={val} value={val}>{t(`task.priority${val.charAt(0).toUpperCase()}${val.slice(1)}`)}</option>
                ))}
              </select>
              <span className={`mt-1.5 inline-block rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[priority]}`}>
                {t(`task.priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`)}
              </span>
            </div>

            <div>
              <label htmlFor="task-due" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('task.dueDate')}
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Background color */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('task.cardColor')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {/* No color */}
              <button
                type="button"
                title={t('task.noColor')}
                onClick={() => setBgColor(null)}
                className={[
                  'h-6 w-6 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 transition-all',
                  bgColor === null
                    ? 'border-indigo-500 scale-110 shadow-sm'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
                ].join(' ')}
              >
                <svg className="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="1" y1="1" x2="11" y2="11" />
                  <line x1="11" y1="1" x2="1" y2="11" />
                </svg>
              </button>

              {TASK_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => setBgColor(c.id)}
                  className={[
                    `h-6 w-6 rounded-full border-2 transition-all ${TASK_COLOR_DOT[c.id]}`,
                    bgColor === c.id
                      ? 'border-indigo-500 scale-110 shadow-sm'
                      : 'border-transparent hover:scale-105',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>

          {/* Assignees */}
          {members.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('task.assignees')}
              </p>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const selected = assigneeIds.includes(member.userId)
                  return (
                    <button
                      key={member.userId}
                      type="button"
                      onClick={() => toggleAssignee(member.userId)}
                      className={[
                        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                        selected
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                      ].join(' ')}
                    >
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="h-4 w-4 rounded-full object-cover" />
                      ) : (
                        <div className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${avatarBg(member.userId)}`}>
                          {getInitials(member.name)}
                        </div>
                      )}
                      {member.name}
                      {selected && (
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 8.586l5.293-5.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Edit-mode only: Pomodoro */}
          {!isCreate && task && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('task.pomodoro')}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-3xl font-mono font-semibold text-gray-900 dark:text-gray-100 leading-none">
                    {formatTime(secondsLeft)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {timerStatus === 'running' && t('task.focusSession')}
                    {timerStatus === 'paused' && t('task.paused')}
                    {timerStatus === 'idle' && t('task.ready')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {timerStatus === 'idle' && (
                    <button onClick={startTimer} disabled={isTimerLoading}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {isTimerLoading ? '…' : t('task.start')}
                    </button>
                  )}
                  {timerStatus === 'running' && (
                    <button onClick={pauseTimer}
                      className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
                      {t('task.pause')}
                    </button>
                  )}
                  {timerStatus === 'paused' && (
                    <button onClick={resumeTimer}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                      {t('task.resume')}
                    </button>
                  )}
                  {timerStatus !== 'idle' && (
                    <button onClick={stopTimer} disabled={isTimerLoading}
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                      {isTimerLoading ? '…' : t('task.stop')}
                    </button>
                  )}
                </div>
              </div>
              {timerError && <p className="mt-2 text-xs text-red-500 dark:text-red-400">{timerError}</p>}
            </div>
          )}

          {/* Edit-mode only: Checklists */}
          {!isCreate && task && task.checklists.length > 0 && task.checklists.map((checklist) => {
            const total = checklist.items.length
            const completed = checklist.items.filter((i) => checkedItems.has(i.id)).length
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0
            return (
              <div key={checklist.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {checklist.title}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{completed} / {total}</span>
                </div>
                <div className="mb-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-1.5 rounded-full bg-indigo-500 transition-all duration-200" style={{ width: `${pct}%` }} />
                </div>
                <ul className="space-y-2">
                  {checklist.items.slice().sort((a, b) => a.position - b.position).map((item) => {
                    const isChecked = checkedItems.has(item.id)
                    return (
                      <li key={item.id} className="flex items-start gap-2.5">
                        <input type="checkbox" id={`item-${item.id}`} checked={isChecked} onChange={() => toggleItem(item.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                        <label htmlFor={`item-${item.id}`}
                          className={`text-sm cursor-pointer select-none leading-snug ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {item.title}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          {/* Edit-mode only: Recurring */}
          {!isCreate && task && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('task.recurring')}
              </p>
              {isPro ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('task.recurringComingSoon')}</p>
              ) : (
                <PremiumGate
                  feature="Recurring tasks"
                  description="Automatically repeat this task daily, weekly, or on a custom schedule."
                  ctaLabel={t('task.recurringUnlock')}
                />
              )}
            </div>
          )}

          {/* Edit-mode only: Labels */}
          {!isCreate && task && task.labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('task.labels')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((label) => (
                  <span key={label.id} className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: label.color }}>
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 shrink-0">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={deleting}
              className="rounded-md border border-gray-300 dark:border-gray-700 px-4 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {t('task.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={deleting}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isCreate ? t('task.create') : t('task.save')}
            </button>
          </div>

          {!isCreate && onDelete && (
            <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
              {confirmDelete ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('task.deleteWarning')}</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {t('task.cancel')}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? t('task.deleting') : t('task.deleteConfirm')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                >
                  {t('task.delete')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
