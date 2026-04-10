import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import type { Column } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  column: Column
  onAddTask: (title: string) => Promise<void>
  onMoveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({ column, onAddTask, onMoveTask, onTaskClick }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragStart(e: DragEvent<HTMLDivElement>, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('fromColumnId', column.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
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
    // Фокус на следующий тик после рендера input
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
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submitAdd()
    if (e.key === 'Escape') cancelAdd()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'flex w-64 shrink-0 flex-col rounded-xl border transition-colors',
        isDragOver
          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
          : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900',
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {column.title}
        </span>
        <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
          {column.tasks.length}
        </span>
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
  )
}
