import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { boardsApi } from '@/shared/api/boardsApi'
import { workspacesApi } from '@/shared/api/workspacesApi'
import type { BoardSummary } from '@/shared/api/boardsApi'

export function BoardNav({ onClose }: { onClose?: () => void }) {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeBoardId = searchParams.get('board')

  useEffect(() => {
    let cancelled = false
    workspacesApi.listWorkspaces().then((workspaces) => {
      if (cancelled || workspaces.length === 0) return
      const ws = workspaces[0]
      setWorkspaceId(ws.id)
      boardsApi.listBoards(ws.id).then((list) => {
        if (!cancelled) setBoards(list)
      })
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (showForm) inputRef.current?.focus()
  }, [showForm])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title || !workspaceId || creating) return
    setCreating(true)
    try {
      const created = await boardsApi.createBoard({ workspaceId, title })
      const summary: BoardSummary = {
        id: created.id,
        workspaceId: created.workspaceId,
        title: created.title,
        description: created.description,
        columnCount: 0,
        taskCount: 0,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      }
      setBoards((prev) => [...prev, summary])
      setNewTitle('')
      setShowForm(false)
      navigate(`/dashboard?board=${created.id}`)
      onClose?.()
    } finally {
      setCreating(false)
    }
  }

  function handleBoardClick(boardId: string) {
    navigate(`/dashboard?board=${boardId}`)
    onClose?.()
  }

  return (
    <li>
      {/* Секция заголовок */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Boards
        </span>
        <button
          type="button"
          title="New board"
          onClick={() => setShowForm((v) => !v)}
          className="rounded p-0.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Список досок */}
      <ul className="mb-1">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId
          return (
            <li key={board.id}>
              <button
                type="button"
                onClick={() => handleBoardClick(board.id)}
                className={[
                  'w-full flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors text-left',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-950 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    isActive ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600',
                  ].join(' ')}
                />
                <span className="truncate">{board.title}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Инлайн-форма создания */}
      {showForm && (
        <form onSubmit={handleCreate} className="px-3 pb-2">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Board name"
            disabled={creating}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <div className="mt-1.5 flex gap-1.5">
            <button
              type="submit"
              disabled={!newTitle.trim() || creating}
              className="flex-1 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewTitle('') }}
              className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  )
}
