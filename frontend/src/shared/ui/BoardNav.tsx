import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ModalOverlay } from '@/shared/ui/Modal'
import { Avatar } from '@/shared/ui/Avatar'
import { boardsApi } from '@/shared/api/boardsApi'
import { workspacesApi } from '@/shared/api/workspacesApi'
import { boardMembersStore } from '@/shared/lib/boardMembersStore'
import { usersApi } from '@/shared/api/usersApi'
import type { BoardSummary } from '@/shared/api/boardsApi'
import type { WorkspaceMember } from '@/shared/api/workspacesApi'
import type { UserSearchResult } from '@/shared/api/usersApi'
import type { BoardMember } from '@/entities/board/types'
import type { WorkspaceRole } from '@/shared/types/workspace'

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

  // Members
  const [wsMembers, setWsMembers] = useState<WorkspaceMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showInviteRow, setShowInviteRow] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [pendingInvites, setPendingInvites] = useState<{ email: string; name: string; role: 'admin' | 'member' }[]>([])
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inviteInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    let cancelled = false
    workspacesApi.listMembers(workspaceId)
      .then((list) => { if (!cancelled) setWsMembers(list) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMembersLoading(false) })
    return () => { cancelled = true }
  }, [workspaceId])

  // Когда участники загрузились и их нет — сразу показываем форму инвайта
  useEffect(() => {
    if (!membersLoading && wsMembers.length === 0) setShowInviteRow(true)
  }, [membersLoading, wsMembers.length])

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleInviteEmailChange(value: string) {
    setInviteEmail(value)
    setInviteError(null)
    setSuggestionsOpen(false)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (value.trim().length < 2) { setSuggestions([]); return }
    searchTimerRef.current = setTimeout(async () => {
      const results = await usersApi.search(value.trim()).catch(() => [])
      const already = new Set([
        ...wsMembers.map((m) => m.email.toLowerCase()),
        ...pendingInvites.map((i) => i.email.toLowerCase()),
      ])
      setSuggestions(results.filter((r) => !already.has(r.email.toLowerCase())))
      setSuggestionsOpen(true)
    }, 250)
  }

  function selectSuggestion(user: UserSearchResult) {
    setInviteEmail(user.email)
    setSuggestions([])
    setSuggestionsOpen(false)
    inviteInputRef.current?.focus()
  }

  function handleAddInvite(emailOverride?: string, nameOverride?: string) {
    const email = (emailOverride ?? inviteEmail).trim()
    if (!email) return
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setInviteError('Invalid email'); return }
    const alreadyInWs = wsMembers.some((m) => m.email.toLowerCase() === email.toLowerCase())
    const alreadyPending = pendingInvites.some((i) => i.email.toLowerCase() === email.toLowerCase())
    if (alreadyInWs || alreadyPending) { setInviteError('Already added'); return }
    const name = nameOverride ?? suggestions.find((s) => s.email === email)?.name ?? email.split('@')[0]
    setPendingInvites((prev) => [...prev, { email, name, role: inviteRole }])
    setInviteEmail('')
    setInviteRole('member')
    setInviteError(null)
    setSuggestions([])
    setSuggestionsOpen(false)
    setShowInviteRow(wsMembers.length === 0)
  }

  function handleInviteKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddInvite() }
    if (e.key === 'Escape') { setSuggestionsOpen(false) }
  }

  function removePendingInvite(email: string) {
    setPendingInvites((prev) => prev.filter((i) => i.email !== email))
  }

  function buildBoardMembers(boardId: string): BoardMember[] {
    const now = new Date().toISOString()
    const fromWs: BoardMember[] = wsMembers
      .filter((m) => selectedIds.has(m.id))
      .map((m) => ({
        id: `bm-ws-${m.id}`,
        userId: m.user_id,
        name: m.name,
        email: m.email,
        avatarUrl: m.avatar_url,
        role: m.role as WorkspaceRole,
        status: 'active' as const,
        joinedAt: now,
      }))
    const fromInvites: BoardMember[] = pendingInvites.map((inv, i) => ({
      id: `bm-inv-${boardId}-${i}`,
      userId: '',
      name: inv.name,
      email: inv.email,
      avatarUrl: null,
      role: inv.role,
      status: 'pending' as const,
      joinedAt: now,
    }))
    return [...fromWs, ...fromInvites]
  }

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
      const members = buildBoardMembers(created.id)
      if (members.length > 0) boardMembersStore.set(created.id, members)
      onCreated(created)
    } catch {
      setError('Failed to create board. Please try again.')
      setCreating(false)
    }
  }

  const totalSelected = selectedIds.size + pendingInvites.length

  return (
    <ModalOverlay onClose={onClose} wide>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">New board</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className={labelClass}>
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What is this board for?"
            disabled={creating}
            rows={2}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {/* ── Members ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass + ' mb-0'}>
              Members{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {totalSelected > 0 && (
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {totalSelected} selected
              </span>
            )}
          </div>

          {membersLoading ? (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : wsMembers.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {wsMembers.map((m) => {
                const selected = selectedIds.has(m.id)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    title={m.email}
                    className={[
                      'flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium transition-all',
                      selected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                    ].join(' ')}
                  >
                    <Avatar name={m.name} avatarUrl={m.avatar_url} size="sm" />
                    <span>{m.name}</span>
                    {selected && (
                      <svg className="h-3 w-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          ) : null}

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {pendingInvites.map((inv) => (
                <span
                  key={inv.email}
                  className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
                >
                  {inv.email}
                  <button
                    type="button"
                    onClick={() => removePendingInvite(inv.email)}
                    className="ml-0.5 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Invite toggle / form */}
          {wsMembers.length > 0 && !showInviteRow && (
            <button
              type="button"
              onClick={() => setShowInviteRow(true)}
              className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              + Invite someone new
            </button>
          )}

          {showInviteRow && (
            <div className="space-y-1">
              <div className="flex gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={inviteInputRef}
                    type="text"
                    value={inviteEmail}
                    onChange={(e) => handleInviteEmailChange(e.target.value)}
                    onKeyDown={handleInviteKeyDown}
                    onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                    onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                    placeholder="email@example.com"
                    autoComplete="off"
                    className={`${fieldClass} w-full`}
                  />
                  {suggestionsOpen && suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
                      {suggestions.map((user) => (
                        <li key={user.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectSuggestion(user) }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Avatar name={user.name} avatarUrl={user.avatar_url} size="sm" />
                            <div className="min-w-0 text-left">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAddInvite()}
                  disabled={!inviteEmail.trim()}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
              {wsMembers.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setShowInviteRow(false); setInviteEmail(''); setInviteError(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Cancel invite
                </button>
              )}
            </div>
          )}
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

