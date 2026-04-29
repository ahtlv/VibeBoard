import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import type { Column } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'
import { TaskCard } from './TaskCard'
import { EditColumnModal } from './EditColumnModal'

interface KanbanColumnProps {
  column: Column
  onAddTask: (title: string) => Promise<void>
  onMoveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void
  onTaskClick: (task: Task) => void
  onUpdateColumn: (columnId: string, patch: { title?: string; color?: string | null }) => void
  onDeleteColumn: (columnId: string) => void
  canEdit?: boolean
}

export function KanbanColumn({ column, onAddTask, onMoveTask, onTaskClick, onUpdateColumn, onDeleteColumn, canEdit = false }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragStart(e: DragEvent<HTMLDivElement>, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('fromColumnId', column.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    const fromColumnId = e.dataTransfer.getData('fromColumnId')
    if (taskId && fromColumnId !== column.id) {
      onMoveTask(taskId, fromColumnId, column.id)
    }
  }

  function openAddForm() {
    setIsAdding(true)
    setDraftTitle('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancelAdd() {
    setIsAdding(false)
    setDraftTitle('')
  }

  async function submitAdd() {
    const title = draftTitle.trim()
    if (!title || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onAddTask(title)
      setDraftTitle('')
      setIsAdding(false)
      toast.success('Task added')
    } catch {
      toast.error('Failed to add task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submitAdd()
    if (e.key === 'Escape') cancelAdd()
  }

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'group flex w-64 shrink-0 flex-col rounded-xl border transition-colors overflow-hidden',
          isDragOver
            ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
            : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900',
        ].join(' ')}
      >
        {/* Цветная полоска */}
        {column.color && (
          <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: column.color }} />
        )}

        {/* Column header */}
        <div className="relative flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {column.title}
          </span>
          <div className="flex items-center gap-1.5">
            {canEdit && <button
              type="button"
              title="Edit column"
              onClick={() => setIsEditing(true)}
              className="rounded p-0.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>}
            <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
              {column.tasks.length}
            </span>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex-1 space-y-2 px-2 pb-2">
          {column.tasks.length === 0 && !isAdding ? (
            <div className={[
              'rounded-lg border border-dashed p-3 text-center text-xs transition-colors',
              isDragOver
                ? 'border-indigo-300 dark:border-indigo-700 text-indigo-400 dark:text-indigo-500'
                : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600',
            ].join(' ')}>
              {isDragOver ? 'Drop here' : 'No tasks yet'}
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onDragStart={(e) => handleDragStart(e, task.id)}
              />
            ))
          )}
        </div>

        {/* Inline add form */}
        {isAdding ? (
          <div className="mx-2 mb-2 space-y-1.5">
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Task title…"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <div className="flex gap-1.5">
              <button
                onClick={submitAdd}
                disabled={!draftTitle.trim() || isSubmitting}
                className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding…' : 'Add'}
              </button>
              <button
                onClick={cancelAdd}
                disabled={isSubmitting}
                className="rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openAddForm}
            className="mx-2 mb-2 rounded-lg px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            + Add task
          </button>
        )}
      </div>

      {isEditing && (
        <EditColumnModal
          column={column}
          onSave={(patch) => { onUpdateColumn(column.id, patch); setIsEditing(false) }}
          onDelete={() => { onDeleteColumn(column.id); setIsEditing(false) }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  )
}
