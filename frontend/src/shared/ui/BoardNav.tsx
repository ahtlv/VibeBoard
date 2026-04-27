import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { boardsApi } from '@/shared/api/boardsApi'
import { workspacesApi } from '@/shared/api/workspacesApi'
import type { BoardSummary } from '@/shared/api/boardsApi'

const inputClass = 'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50'

export function BoardNav({ onClose }: { onClose?: () => void }) {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingBoard, setEditingBoard] = useState<BoardSummary | null>(null)
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
      const created = await boardsApi.createBoard({
        workspaceId,
        title,
        description: newDesc.trim() || undefined,
      })
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
      setNewDesc('')
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
      {/* Заголовок секции — стиль как у других пунктов меню */}
      <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>Boards</span>
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
            <li key={board.id} className="group relative">
              <button
                type="button"
                onClick={() => handleBoardClick(board.id)}
                className={[
                  'w-full flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors text-left pr-8',
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

              {/* Кнопка редактирования — появляется при hover */}
              <button
                type="button"
                title="Edit board"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingBoard(board)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
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
            className={inputClass}
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            disabled={creating}
            rows={3}
            className={`${inputClass} mt-1.5 resize-none`}
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
              onClick={() => { setShowForm(false); setNewTitle(''); setNewDesc('') }}
              className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Модалка редактирования */}
      {editingBoard && (
        <EditBoardModal
          board={editingBoard}
          activeBoardId={activeBoardId}
          onSave={(updated) => {
            setBoards((prev) => prev.map((b) => b.id === updated.id ? { ...b, ...updated } : b))
            setEditingBoard(null)
          }}
          onDelete={(boardId) => {
            const remaining = boards.filter((b) => b.id !== boardId)
            setBoards(remaining)
            setEditingBoard(null)
            if (activeBoardId === boardId) {
              navigate(remaining.length > 0 ? `/dashboard?board=${remaining[0].id}` : '/dashboard')
            }
          }}
          onClose={() => setEditingBoard(null)}
        />
      )}
    </li>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

interface EditBoardModalProps {
  board: BoardSummary
  activeBoardId: string | null
  onSave: (updated: Pick<BoardSummary, 'id' | 'title' | 'description'>) => void
  onDelete: (boardId: string) => void
  onClose: () => void
}

function EditBoardModal({ board, onSave, onDelete, onClose }: EditBoardModalProps) {
  const [title, setTitle] = useState(board.title)
  const [desc, setDesc] = useState(board.description ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    setSaving(true)
    setError(null)
    try {
      await boardsApi.updateBoard(board.id, {
        title: trimmedTitle,
        description: desc.trim() || null,
      })
      onSave({ id: board.id, title: trimmedTitle, description: desc.trim() || null })
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await boardsApi.deleteBoard(board.id)
      onDelete(board.id)
    } catch {
      setError('Failed to delete. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Edit board</h3>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving || deleting}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              disabled={saving || deleting}
              rows={3}
              className="w-full resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || deleting || !title.trim()}
              className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="w-full rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete board'}
          </button>
        </div>
      </div>
    </div>
  )
}
