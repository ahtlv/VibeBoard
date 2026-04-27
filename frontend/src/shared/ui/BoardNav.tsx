import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { boardsApi } from '@/shared/api/boardsApi'
import { workspacesApi } from '@/shared/api/workspacesApi'
import type { BoardSummary } from '@/shared/api/boardsApi'

export function BoardNav({ onClose }: { onClose?: () => void }) {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBoard, setEditingBoard] = useState<BoardSummary | null>(null)
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

  function handleBoardClick(boardId: string) {
    navigate(`/dashboard?board=${boardId}`)
    onClose?.()
  }

  return (
    <li>
      {/* Заголовок секции */}
      <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>Boards</span>
        <button
          type="button"
          title="New board"
          onClick={() => setShowCreateModal(true)}
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
                <span className={[
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  isActive ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600',
                ].join(' ')} />
                <span className="truncate">{board.title}</span>
              </button>

              <button
                type="button"
                title="Edit board"
                onClick={(e) => { e.stopPropagation(); setEditingBoard(board) }}
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

      {/* Модалка создания */}
      {showCreateModal && workspaceId && (
        <CreateBoardModal
          workspaceId={workspaceId}
          onCreated={(summary) => {
            setBoards((prev) => [...prev, summary])
            setShowCreateModal(false)
            navigate(`/dashboard?board=${summary.id}`)
            onClose?.()
          }}
          onClose={() => setShowCreateModal(false)}
        />
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

// ── Общие стили ───────────────────────────────────────────────────────────────

const fieldClass = 'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50'
const labelClass = 'mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300'

// ── Create Board Modal ────────────────────────────────────────────────────────

interface CreateBoardModalProps {
  workspaceId: string
  onCreated: (summary: BoardSummary) => void
  onClose: () => void
}

function CreateBoardModal({ workspaceId, onCreated, onClose }: CreateBoardModalProps) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle || creating) return
    setCreating(true)
    setError(null)
    try {
      const created = await boardsApi.createBoard({
        workspaceId,
        title: trimmedTitle,
        description: desc.trim() || undefined,
      })
      onCreated(created)
    } catch {
      setError('Failed to create board. Please try again.')
      setCreating(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">New board</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Name</label>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My board"
            disabled={creating}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What is this board for?"
            disabled={creating}
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create board'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ── Edit Board Modal ──────────────────────────────────────────────────────────

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
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    setSaving(true)
    setError(null)
    try {
      await boardsApi.updateBoard(board.id, { title: trimmedTitle, description: desc.trim() || null })
      onSave({ id: board.id, title: trimmedTitle, description: desc.trim() || null })
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await boardsApi.deleteBoard(board.id)
      onDelete(board.id)
    } catch {
      setError('Failed to delete. Please try again.')
      setDeleting(false)
    }
  }

  if (confirmDelete) {
    return (
      <DeleteConfirmModal
        boardTitle={board.title}
        deleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">Edit board</h3>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className={labelClass}>Name</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving || deleting}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={saving || deleting}
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving || deleting || !title.trim()}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={saving || deleting}
          className="w-full rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50"
        >
          Delete board…
        </button>
      </div>
    </ModalOverlay>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  boardTitle: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({ boardTitle, deleting, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="flex flex-col items-center text-center">
        {/* Иконка предупреждения */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Delete board?</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You are about to delete{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">"{boardTitle}"</span>.
          All columns and tasks will be lost. This action cannot be undone.
        </p>

        <div className="mt-6 flex w-full gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {deleting ? 'Deleting…' : 'Delete board'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── Modal Overlay ─────────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
