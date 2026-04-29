import { useState, type DragEvent } from 'react'
import type { Column } from '@/entities/board/types'
import type { BoardMember } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'
import { TaskCard } from './TaskCard'
import { EditColumnModal } from './EditColumnModal'

interface KanbanColumnProps {
  column: Column
  members: BoardMember[]
  onRequestAddTask: (columnId: string) => void
  onMoveTask: (taskId: string, fromColumnId: string, toColumnId: string, targetIndex: number) => void
  onTaskClick: (task: Task) => void
  onUpdateColumn: (columnId: string, patch: { title?: string; color?: string | null }) => void
  onDeleteColumn: (columnId: string) => void
  canEdit?: boolean
}

export function KanbanColumn({
  column,
  members,
  onRequestAddTask,
  onMoveTask,
  onTaskClick,
  onUpdateColumn,
  onDeleteColumn,
  canEdit = false,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  function handleDragStart(e: DragEvent<HTMLDivElement>, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('fromColumnId', column.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleColumnDragOver(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  function handleColumnDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDropTargetIndex(null)
    }
  }

  function handleColumnDrop(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    setIsDragOver(false)
    setDropTargetIndex(null)
    const taskId = e.dataTransfer.getData('taskId')
    const fromColumnId = e.dataTransfer.getData('fromColumnId')
    if (taskId && fromColumnId !== column.id) {
      onMoveTask(taskId, fromColumnId, column.id, column.tasks.length)
    }
  }

  function handleDropZoneDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    if (e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
    setDropTargetIndex(index)
  }

  function handleDropZoneDrop(e: DragEvent<HTMLDivElement>, index: number) {
    if (e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDropTargetIndex(null)
    const taskId = e.dataTransfer.getData('taskId')
    const fromColumnId = e.dataTransfer.getData('fromColumnId')
    if (!taskId) return
    onMoveTask(taskId, fromColumnId, column.id, index)
  }

  return (
    <>
      <div
        onDragOver={handleColumnDragOver}
        onDragLeave={handleColumnDragLeave}
        onDrop={handleColumnDrop}
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
            {canEdit && (
              <button
                type="button"
                title="Edit column"
                onClick={() => setIsEditing(true)}
                className="rounded p-0.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
              {column.tasks.length}
            </span>
            {/* Кнопка добавления задачи */}
            <button
              type="button"
              title="Add task"
              aria-label="Add task"
              onClick={() => onRequestAddTask(column.id)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tasks with drop zones */}
        <div className="flex-1 px-2 pb-2">
          {column.tasks.length === 0 ? (
            <>
              {/* Drop zone when empty */}
              <div
                onDragOver={(e) => handleDropZoneDragOver(e, 0)}
                onDrop={(e) => handleDropZoneDrop(e, 0)}
                className={[
                  'rounded-lg border border-dashed p-3 text-center text-xs transition-colors',
                  dropTargetIndex === 0
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500'
                    : isDragOver
                    ? 'border-indigo-300 dark:border-indigo-700 text-indigo-400 dark:text-indigo-500'
                    : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600',
                ].join(' ')}
              >
                {isDragOver ? 'Drop here' : 'No tasks yet'}
              </div>
            </>
          ) : (
            <div className="space-y-0">
              {/* Drop zone before first card */}
              <DropZone
                index={0}
                active={dropTargetIndex === 0}
                onDragOver={handleDropZoneDragOver}
                onDrop={handleDropZoneDrop}
              />
              {column.tasks.map((task, i) => (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    members={members}
                    onClick={() => onTaskClick(task)}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  />
                  {/* Drop zone after each card */}
                  <DropZone
                    index={i + 1}
                    active={dropTargetIndex === i + 1}
                    onDragOver={handleDropZoneDragOver}
                    onDrop={handleDropZoneDrop}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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

function DropZone({
  index,
  active,
  onDragOver,
  onDrop,
}: {
  index: number
  active: boolean
  onDragOver: (e: DragEvent<HTMLDivElement>, index: number) => void
  onDrop: (e: DragEvent<HTMLDivElement>, index: number) => void
}) {
  return (
    <div
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={[
        'mx-0 transition-all duration-100',
        active
          ? 'h-2 my-0.5 rounded-full bg-indigo-400 dark:bg-indigo-600 opacity-100'
          : 'h-1 my-0',
      ].join(' ')}
    />
  )
}
