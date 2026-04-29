import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/shared/ui/AppShell'
import { BoardHeader, KanbanColumn, TaskModal } from '@/widgets'
import { boardsApi, workspacesApi } from '@/shared/api'
import { tasksApi, mapTask } from '@/shared/api/tasksApi'
import type { BoardSummary } from '@/shared/api/boardsApi'
import type { WorkspaceResponse } from '@/shared/api/workspacesApi'
import type { Board, BoardMember, Column } from '@/entities/board/types'
import type { Task } from '@/entities/task/types'
import type { WorkspaceRole } from '@/shared/types/workspace'
import { boardMembersStore } from '@/shared/lib/boardMembersStore'
import { boardMembersApi } from '@/shared/api/boardMembersApi'
import { DEFAULT_COLUMN_COLORS } from '@/entities/board/columnColors'
import { useAuth } from '@/features/auth/store'

type LoadState = 'loading' | 'error' | 'empty' | 'ready'

export function DashboardPage() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null)
  const [boardSummaries, setBoardSummaries] = useState<BoardSummary[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [boardLoading, setBoardLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [members, setMembers] = useState<BoardMember[]>([])
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)
  const [draggingColId, setDraggingColId] = useState<string | null>(null)
  const dragSnapshotRef = useRef<Board | null>(null)
  const dropSucceededRef = useRef(false)
  const lastDragOverRef = useRef<string | null>(null)
  useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const boardIdFromUrl = searchParams.get('board')
  const initialBoardId = useRef(boardIdFromUrl)

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

        const startId = initialBoardId.current && boards.find(b => b.id === initialBoardId.current)
          ? initialBoardId.current
          : boards[0].id

        setActiveBoardId(startId)
        setLoadState('ready')

        if (!initialBoardId.current) {
          navigate(`/dashboard?board=${startId}`, { replace: true })
        }
      } catch {
        if (!cancelled) setLoadState('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // Загружаем полную доску (колонки + задачи) когда меняется activeBoardId
  useEffect(() => {
    if (!activeBoardId) return
    let cancelled = false

    setBoardLoading(true)
    // Предзаполняем из store если борд только что создан с участниками
    const preseeded = boardMembersStore.consume(activeBoardId)
    if (preseeded) setMembers(preseeded)

    Promise.all([
      boardsApi.getBoard(activeBoardId),
      boardMembersApi.list(activeBoardId).catch(() => [] as BoardMember[]),
    ])
      .then(([boardData, membersData]) => {
        if (!cancelled) {
          setBoard(boardData)
          setMembers(membersData)
        }
      })
      .catch(() => { if (!cancelled) { setBoard(null); setMembers([]) } })
      .finally(() => { if (!cancelled) setBoardLoading(false) })

    return () => { cancelled = true }
  }, [activeBoardId])

  async function handleInviteMember(email: string, role: WorkspaceRole) {
    if (!activeBoardId || role === 'owner') return
    try {
      const newMember = await boardMembersApi.add(activeBoardId, email, role as 'admin' | 'member')
      setMembers((prev) => [...prev, newMember])
    } catch {
      // Молча — InviteMembersModal сама покажет ошибку если нужно
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!activeBoardId) return
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    await boardMembersApi.remove(activeBoardId, memberId).catch(() => {
      // Откат при ошибке
      boardMembersApi.list(activeBoardId).then(setMembers).catch(() => {})
    })
  }

  async function handleChangeMemberRole(memberId: string, role: WorkspaceRole) {
    if (!activeBoardId || role === 'owner') return
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m))
    await boardMembersApi.updateRole(activeBoardId, memberId, role as 'admin' | 'member').catch(() => {
      boardMembersApi.list(activeBoardId).then(setMembers).catch(() => {})
    })
  }

  async function handleCreateWorkspace(e: FormEvent) {
    e.preventDefault()
    const name = newWorkspaceName.trim()
    if (!name) return
    setCreatingWorkspace(true)
    try {
      await workspacesApi.createWorkspace({ name })
      setNewWorkspaceName('')
      setLoadState('loading')
      const workspaces = await workspacesApi.listWorkspaces()
      if (workspaces.length > 0) {
        const ws = workspaces[0]
        setWorkspace(ws)
        const boards = await boardsApi.listBoards(ws.id)
        setBoardSummaries(boards)
        setLoadState(boards.length === 0 ? 'empty' : 'ready')
        if (boards.length > 0) {
          setActiveBoardId(boards[0].id)
        }
      }
    } catch {
      setCreatingWorkspace(false)
    } finally {
      setCreatingWorkspace(false)
    }
  }

  // При смене URL (клик в сайдбаре) — обновляем activeBoardId
  useEffect(() => {
    if (boardSummaries.length === 0) return
    const target = boardSummaries.find((b) => b.id === boardIdFromUrl) ?? boardSummaries[0]
    if (target.id !== activeBoardId) {
      setActiveBoardId(target.id)
    }
  }, [boardIdFromUrl, boardSummaries])

  async function handleAddTask(columnId: string, title: string) {
    if (!board || !activeBoardId) return

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

  async function handleAddColumn(title: string, color: string | null) {
    if (!board || !activeBoardId) return

    const tempId = `temp-col-${Date.now()}`
    const optimistic: Column = { id: tempId, boardId: activeBoardId, title, color, position: board.columns.length, tasks: [] }
    setBoard((prev) => prev ? { ...prev, columns: [...prev.columns, optimistic] } : prev)

    try {
      const real = await boardsApi.createColumn(activeBoardId, { title })
      setBoard((prev) => prev
        ? { ...prev, columns: prev.columns.map((c) => c.id === tempId ? { ...real, color } : c) }
        : prev)
    } catch {
      setBoard((prev) => prev
        ? { ...prev, columns: prev.columns.filter((c) => c.id !== tempId) }
        : prev)
    }
  }

  function handleUpdateColumn(columnId: string, patch: { title?: string; color?: string | null }) {
    const snapshot = board
    setBoard((prev) => prev
      ? { ...prev, columns: prev.columns.map((c) => c.id === columnId ? { ...c, ...patch } : c) }
      : prev)

    boardsApi.updateColumn(columnId, patch).catch(() => {
      setBoard(snapshot)
    })
  }

  function handleDeleteColumn(columnId: string) {
    const snapshot = board
    setBoard((prev) => prev
      ? { ...prev, columns: prev.columns.filter((c) => c.id !== columnId) }
      : prev)

    boardsApi.deleteColumn(columnId).catch(() => {
      setBoard(snapshot)
    })
  }

  function handleColumnDragStart(e: DragEvent<HTMLDivElement>, columnId: string) {
    if (e.target !== e.currentTarget) return
    e.dataTransfer.setData('application/column-id', columnId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingColId(columnId)
    dragSnapshotRef.current = board
    dropSucceededRef.current = false
    lastDragOverRef.current = columnId
  }

  function handleColumnDragOver(e: DragEvent<HTMLDivElement>, targetColumnId: string) {
    if (!e.dataTransfer.types.includes('application/column-id')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (lastDragOverRef.current === targetColumnId) return
    lastDragOverRef.current = targetColumnId
    setBoard((prev) => {
      if (!prev || !draggingColId || draggingColId === targetColumnId) return prev
      const cols = prev.columns
      const fromIdx = cols.findIndex((c) => c.id === draggingColId)
      const toIdx = cols.findIndex((c) => c.id === targetColumnId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const reordered = [...cols]
      ;[reordered[fromIdx], reordered[toIdx]] = [reordered[toIdx], reordered[fromIdx]]
      return { ...prev, columns: reordered.map((c, i) => ({ ...c, position: i })) }
    })
  }

  function handleColumnDrop(e: DragEvent<HTMLDivElement>, _targetColumnId: string) {
    e.preventDefault()
    if (!e.dataTransfer.types.includes('application/column-id')) return
    if (!board || !activeBoardId) return
    dropSucceededRef.current = true
    const snapshot = dragSnapshotRef.current
    boardsApi.reorderColumns(activeBoardId, board.columns.map((c) => c.id)).catch(() => {
      if (snapshot) setBoard(snapshot)
    })
  }

  function handleColumnDragEnd() {
    if (!dropSucceededRef.current && dragSnapshotRef.current) {
      setBoard(dragSnapshotRef.current)
    }
    setDraggingColId(null)
    dragSnapshotRef.current = null
    dropSucceededRef.current = false
    lastDragOverRef.current = null
  }

  function handleMoveTask(taskId: string, fromColumnId: string, toColumnId: string) {
    if (!board) return
    setMoveError(null)

    const snapshot = board

    const toCol = board.columns.find((c) => c.id === toColumnId)
    const targetPosition = toCol ? toCol.tasks.length : 0

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

    tasksApi
      .moveTask(taskId, { columnId: toColumnId, position: targetPosition })
      .catch(() => {
        setBoard(snapshot)
        setMoveError('Failed to move task. Changes reverted.')
        setTimeout(() => setMoveError(null), 4000)
      })
  }

  const showBoardSkeleton = boardLoading || (loadState === 'ready' && !board)

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
            <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex w-64 shrink-0 flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="flex-1 space-y-2 px-2 pb-2">
                    {[0, 1].map((j) => (
                      <div key={j} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                        <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-red-500">Failed to load boards. Please refresh.</p>
            </div>
          )}

          {loadState === 'empty' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              {!workspace ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">You don't have a workspace yet.</p>
                  <form onSubmit={handleCreateWorkspace} className="flex gap-2">
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Workspace name"
                      className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={creatingWorkspace || !newWorkspaceName.trim()}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                      {creatingWorkspace ? 'Creating…' : 'Create workspace'}
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No boards yet.</p>
              )}
            </div>
          )}

          {loadState === 'ready' && (
            <>
              <BoardHeader
                boardName={board?.title ?? '…'}
                description={board?.description ?? null}
                members={members}
                onInvite={handleInviteMember}
                onRemove={handleRemoveMember}
                onChangeRole={handleChangeMemberRole}
              />

              {showBoardSkeleton ? (
                <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex w-64 shrink-0 flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 w-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                      </div>
                      <div className="flex-1 space-y-2 px-2 pb-2">
                        {[0, 1].map((j) => (
                          <div key={j} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                            <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : board && board.columns.length === 0 ? (
                <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto">
                  <AddColumnButton onAdd={handleAddColumn} />
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto">
                  {board?.columns.map((column) => {
                    const canEdit = ['owner', 'admin'].includes(workspace?.role ?? '')
                    const isBeingDragged = draggingColId === column.id
                    return (
                      <div
                        key={column.id}
                        draggable={canEdit}
                        onDragStart={(e) => handleColumnDragStart(e, column.id)}
                        onDragOver={(e) => handleColumnDragOver(e, column.id)}
                        onDrop={(e) => handleColumnDrop(e, column.id)}
                        onDragEnd={handleColumnDragEnd}
                        className={[
                          'transition-all select-none',
                          canEdit ? 'cursor-grab active:cursor-grabbing' : '',
                          isBeingDragged ? 'opacity-40' : '',
                        ].join(' ')}
                      >
                        <KanbanColumn
                          column={column}
                          onAddTask={(title) => handleAddTask(column.id, title)}
                          onMoveTask={handleMoveTask}
                          onTaskClick={setSelectedTask}
                          onUpdateColumn={handleUpdateColumn}
                          onDeleteColumn={handleDeleteColumn}
                          canEdit={canEdit}
                        />
                      </div>
                    )
                  })}
                  <AddColumnButton
                    onAdd={handleAddColumn}
                    canAdd={['owner', 'admin'].includes(workspace?.role ?? '')}
                  />
                </div>
              )}
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
              <p className="text-3xl font-mono font-semibold text-gray-900 dark:text-gray-100">25:00</p>
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

// ── AddColumnButton ───────────────────────────────────────────────────────────

function AddColumnButton({ onAdd, canAdd = false }: { onAdd: (title: string, color: string | null) => void; canAdd?: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)

  function open() {
    setIsEditing(true)
    setDraft('')
    setSelectedColor(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancel() {
    setIsEditing(false)
    setDraft('')
    setSelectedColor(null)
  }

  function submit() {
    const title = draft.trim()
    if (!title) return
    onAdd(title, selectedColor)
    cancel()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') cancel()
  }

  function handleCustomColor(e: ChangeEvent<HTMLInputElement>) {
    setSelectedColor(e.target.value)
  }

  const card = 'self-start w-64 shrink-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 overflow-hidden'
  const btnBase = 'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors'

  if (isEditing) {
    return (
      <div className={`${card} flex flex-col`}>
        {selectedColor && <div className="h-1.5 w-full" style={{ backgroundColor: selectedColor }} />}
        <div className="p-3 flex flex-col gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Column name…"
            className="w-full rounded-md border border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none ring-1 ring-indigo-500 dark:ring-indigo-400"
          />

          {/* Палитра */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* No color */}
            <button
              type="button"
              title="No color"
              onClick={() => setSelectedColor(null)}
              className={[
                'h-5 w-5 rounded-full border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700 transition-all',
                selectedColor === null
                  ? 'border-indigo-500 scale-110'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
              ].join(' ')}
            >
              <svg className="h-2.5 w-2.5 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </button>

            {/* Пресеты */}
            {DEFAULT_COLUMN_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setSelectedColor(c.value)}
                className={[
                  'h-5 w-5 rounded-full border-2 transition-all',
                  selectedColor === c.value
                    ? 'border-indigo-500 scale-110'
                    : 'border-transparent hover:scale-105',
                ].join(' ')}
                style={{ backgroundColor: c.value }}
              />
            ))}

            {/* Custom */}
            <button
              type="button"
              title="Custom color"
              onClick={() => customInputRef.current?.click()}
              className={[
                'h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center',
                selectedColor !== null && !DEFAULT_COLUMN_COLORS.some((c) => c.value === selectedColor)
                  ? 'border-indigo-500 scale-110'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 bg-gradient-to-br from-rose-400 via-violet-400 to-sky-400',
              ].join(' ')}
              style={
                selectedColor !== null && !DEFAULT_COLUMN_COLORS.some((c) => c.value === selectedColor)
                  ? { backgroundColor: selectedColor }
                  : undefined
              }
            >
              {(selectedColor === null || DEFAULT_COLUMN_COLORS.some((c) => c.value === selectedColor)) && (
                <svg className="h-2.5 w-2.5 text-white drop-shadow" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              )}
            </button>
            <input
              ref={customInputRef}
              type="color"
              className="sr-only"
              value={selectedColor ?? '#6366f1'}
              onChange={handleCustomColor}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={!draft.trim()}
              className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50`}
            >
              Add
            </button>
            <button
              onClick={cancel}
              className={`${btnBase} border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!canAdd) return null

  return (
    <button
      onClick={open}
      className="self-start shrink-0 flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-400 dark:text-gray-500 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Add column
    </button>
  )
}
