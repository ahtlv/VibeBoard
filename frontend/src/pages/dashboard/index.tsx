import { useEffect, useState } from 'react'
import { AppShell } from '@/shared/ui/AppShell'
import { BoardHeader, KanbanColumn, TaskModal } from '@/widgets'
import { boardsApi, workspacesApi } from '@/shared/api'
import { tasksApi, mapTask } from '@/shared/api/tasksApi'
import type { BoardSummary } from '@/shared/api/boardsApi'
import type { WorkspaceResponse } from '@/shared/api/workspacesApi'
import type { Board } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'

type LoadState = 'loading' | 'error' | 'empty' | 'ready'

export function DashboardPage() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null)
  const [boardSummaries, setBoardSummaries] = useState<BoardSummary[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)

  // Загружаем workspace → boards при маунте
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadState('loading')
      try {
        const workspaces = await workspacesApi.listWorkspaces()
        if (cancelled) return

        if (workspaces.length === 0) {
          setLoadState('empty')
          return
        }

        const ws = workspaces[0]
        setWorkspace(ws)

        const boards = await boardsApi.listBoards(ws.id)
        if (cancelled) return

        setBoardSummaries(boards)

        if (boards.length === 0) {
          setLoadState('empty')
          return
        }

        setActiveBoardId(boards[0].id)
        setBoard(summaryToBoard(boards[0]))
        setLoadState('ready')
      } catch {
        if (!cancelled) setLoadState('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // При смене активной доски обновляем board из summaries
  useEffect(() => {
    if (!activeBoardId) return
    const summary = boardSummaries.find((b) => b.id === activeBoardId)
    if (summary) setBoard(summaryToBoard(summary))
  }, [activeBoardId, boardSummaries])

  async function handleAddTask(columnId: string, title: string) {
    if (!board || !activeBoardId) return

    // Оптимистичный insert
    const tempId = `temp-${Date.now()}`
    const optimistic: Task = {
      id: tempId,
      boardId: activeBoardId,
      columnId,
      title,
      description: null,
      status: 'todo',
      priority: 'medium',
      position: 9999,
      dueDate: null,
      labels: [],
      checklists: [],
      assigneeIds: [],
      totalTrackedSeconds: 0,
      pomodoroSessionsCount: 0,
      recurring: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBoard((prev) => insertTaskInColumn(prev!, columnId, optimistic))

    try {
      const raw = await tasksApi.createTask({ boardId: activeBoardId, columnId, title })
      const real = mapTask(raw)
      setBoard((prev) => replaceTaskInColumn(prev!, columnId, tempId, real))
    } catch {
      setBoard((prev) => removeTaskFromColumn(prev!, columnId, tempId))
    }
  }

  function handleMoveTask(taskId: string, fromColumnId: string, toColumnId: string) {
    if (!board) return
    setMoveError(null)

    // Сохраняем снапшот для возможного rollback
    const snapshot = board

    // Вычисляем позицию: конец целевой колонки
    const toCol = board.columns.find((c) => c.id === toColumnId)
    const targetPosition = toCol ? toCol.tasks.length : 0

    // Оптимистичный move
    setBoard((prev) => {
      if (!prev) return prev
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

    // Синхронизация с backend (fire-and-forget с rollback)
    tasksApi
      .moveTask(taskId, { columnId: toColumnId, position: targetPosition })
      .catch(() => {
        setBoard(snapshot)
        setMoveError('Failed to move task. Changes reverted.')
        setTimeout(() => setMoveError(null), 4000)
      })
  }

  return (
    <AppShell>
      {moveError && (
        <div className="mx-4 mt-2 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
          {moveError}
        </div>
      )}
      <div className="flex h-full gap-4">
        {/* Main kanban area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {loadState === 'loading' && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">Loading boards…</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-red-500">Failed to load boards. Please refresh.</p>
            </div>
          )}

          {loadState === 'empty' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {workspace ? 'No boards yet.' : 'No workspace found.'}
              </p>
              {workspace && (
                <button
                  onClick={() => {/* TODO: создать первую доску */}}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Create board
                </button>
              )}
            </div>
          )}

          {loadState === 'ready' && board && (
            <>
              <BoardHeader
                boardName={board.title}
                workspaceName={workspace?.name ?? 'Workspace'}
                onAddColumn={() => {/* TODO: создать колонку */}}
                onAddTask={() => {/* TODO: создать задачу */}}
              />

              {/* Board selector strip (если досок > 1) */}
              {boardSummaries.length > 1 && (
                <div className="flex gap-2 px-1 pb-2 overflow-x-auto">
                  {boardSummaries.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBoardId(b.id)}
                      className={[
                        'shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                        b.id === activeBoardId
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                      ].join(' ')}
                    >
                      {b.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Columns area */}
              <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-4">
                {board.columns.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      No columns yet. Add a column to get started.
                    </p>
                  </div>
                ) : (
                  board.columns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      onAddTask={(title) => handleAddTask(column.id, title)}
                      onMoveTask={handleMoveTask}
                      onTaskClick={setSelectedTask}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar tools */}
        <aside className="hidden w-56 shrink-0 xl:flex flex-col gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Pomodoro
            </h2>
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

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Today
            </h2>
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

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </AppShell>
  )
}

// ── board state helpers ───────────────────────────────────────────────────────

function insertTaskInColumn(board: Board, columnId: string, task: Task): Board {
  return {
    ...board,
    columns: board.columns.map((col) =>
      col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col
    ),
  }
}

function replaceTaskInColumn(board: Board, columnId: string, tempId: string, real: Task): Board {
  return {
    ...board,
    columns: board.columns.map((col) =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.map((t) => (t.id === tempId ? real : t)) }
        : col
    ),
  }
}

function removeTaskFromColumn(board: Board, columnId: string, taskId: string): Board {
  return {
    ...board,
    columns: board.columns.map((col) =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        : col
    ),
  }
}

/** Конвертирует BoardSummary (без колонок) в Board для рендера */
function summaryToBoard(summary: BoardSummary): Board {
  return {
    id: summary.id,
    workspaceId: summary.workspaceId,
    title: summary.title,
    description: summary.description,
    columns: [],
    labels: [],
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
  }
}
