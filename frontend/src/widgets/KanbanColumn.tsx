import { useState, type DragEvent } from 'react'
import type { Column } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  column: Column
  onAddTask: () => void
  onMoveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({ column, onAddTask, onMoveTask, onTaskClick }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

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
    // только если курсор ушёл за пределы колонки, не дочернего элемента
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
        {column.tasks.length === 0 ? (
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

      {/* Add task */}
      <button
        onClick={onAddTask}
        className="mx-2 mb-2 rounded-lg px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        + Add task
      </button>
    </div>
  )
}
