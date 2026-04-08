import { useState } from 'react'
import { AppShell } from '@/shared/ui/AppShell'
import { BoardHeader, KanbanColumn, TaskModal } from '@/widgets'
import { MOCK_BOARD } from '@/shared/lib/mock/board'
import type { Board } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'

export function DashboardPage() {
  const [board, setBoard] = useState<Board>(MOCK_BOARD)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  function handleMoveTask(taskId: string, fromColumnId: string, toColumnId: string) {
    setBoard((prev) => {
      const fromCol = prev.columns.find((c) => c.id === fromColumnId)
      const task = fromCol?.tasks.find((t) => t.id === taskId)
      if (!task) return prev

      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === fromColumnId) {
            return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          }
          if (col.id === toColumnId) {
            return { ...col, tasks: [...col.tasks, { ...task, columnId: toColumnId }] }
          }
          return col
        }),
      }
    })
  }

  return (
    <AppShell>
      <div className="flex h-full gap-4">
        {/* Main kanban area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <BoardHeader
            boardName={board.title}
            workspaceName="Personal workspace"
            onAddColumn={() => {/* TODO: открыть модалку создания колонки */}}
            onAddTask={() => {/* TODO: открыть модалку создания задачи */}}
          />

          {/* Columns area */}
          <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-4">
            {/* TODO: заменить board на данные из boardsApi */}
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddTask={() => {/* TODO: открыть модалку с columnId */}}
                onMoveTask={handleMoveTask}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        </div>

        {/* Sidebar tools */}
        <aside className="hidden w-56 shrink-0 xl:flex flex-col gap-3">
          {/* Pomodoro */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Pomodoro
            </h2>
            {/* TODO: PomodoroTimer widget */}
            <div className="text-center">
              <p className="text-3xl font-mono font-semibold text-gray-900 dark:text-gray-100">
                25:00
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Focus session</p>
              <button className="mt-3 w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                Start
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Today
            </h2>
            {/* TODO: DailyStats widget */}
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex justify-between">
                <span>Tasks done</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">0</span>
              </li>
              <li className="flex justify-between">
                <span>Time tracked</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">0h 0m</span>
              </li>
              <li className="flex justify-between">
                <span>Pomodoros</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">0</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Task modal */}
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </AppShell>
  )
}
