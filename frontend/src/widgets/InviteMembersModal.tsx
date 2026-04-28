import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ModalOverlay } from '@/shared/ui/Modal'
import { Avatar } from '@/shared/ui/Avatar'
import { usersApi } from '@/shared/api/usersApi'
import type { UserSearchResult } from '@/shared/api/usersApi'
import type { BoardMember } from '@/entities/board/types'
import type { WorkspaceRole } from '@/shared/types/workspace'

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

const ROLE_BADGE_CLASS: Record<WorkspaceRole, string> = {
  owner: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  admin: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  member: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

interface InviteMembersModalProps {
  members: BoardMember[]
  onInvite: (email: string, role: WorkspaceRole) => void
  onRemove: (memberId: string) => void
  onChangeRole: (memberId: string, role: WorkspaceRole) => void
  onClose: () => void
}

export function InviteMembersModal({
  members,
  onInvite,
  onRemove,
  onChangeRole,
  onClose,
}: InviteMembersModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeMembers = members.filter((m) => m.status === 'active')
  const pendingMembers = members.filter((m) => m.status === 'pending')

  function handleEmailChange(value: string) {
    setEmail(value)
    setEmailError(null)
    setSuggestionsOpen(false)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (value.trim().length < 2) { setSuggestions([]); return }
    searchTimerRef.current = setTimeout(async () => {
      const results = await usersApi.search(value.trim()).catch(() => [])
      const existing = new Set(members.map((m) => m.email.toLowerCase()))
      setSuggestions(results.filter((r) => !existing.has(r.email.toLowerCase())))
      setSuggestionsOpen(true)
    }, 250)
  }

  function selectSuggestion(user: UserSearchResult) {
    setEmail(user.email)
    setSuggestions([])
    setSuggestionsOpen(false)
    inputRef.current?.focus()
  }

  function validateAndSubmit() {
    const trimmed = email.trim()
    if (!trimmed) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) { setEmailError('Invalid email address'); return }

    const isDuplicate = members.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) { setEmailError('This person is already on the board'); return }

    onInvite(trimmed, role)
    setEmail('')
    setEmailError(null)
    setSuggestions([])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    validateAndSubmit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); validateAndSubmit() }
    if (e.key === 'Escape') setSuggestionsOpen(false)
  }

  return (
    <ModalOverlay onClose={onClose} wide>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Board members
        </h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Форма инвайта */}
      <form onSubmit={handleSubmit} className="mb-5">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Invite by email
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
              onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
              placeholder="colleague@example.com"
              autoComplete="off"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={!email.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Invite
          </button>
        </div>
        {emailError && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{emailError}</p>
        )}
      </form>

      {/* Активные участники */}
      {activeMembers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Members · {activeMembers.length}
          </p>
          <ul className="space-y-1">
            {activeMembers.map((m) => (
              <MemberRow key={m.id} member={m} onRemove={onRemove} onChangeRole={onChangeRole} />
            ))}
          </ul>
        </div>
      )}

      {/* Ожидающие инвайты */}
      {pendingMembers.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Pending · {pendingMembers.length}
          </p>
          <ul className="space-y-1">
            {pendingMembers.map((m) => (
              <MemberRow key={m.id} member={m} onRemove={onRemove} onChangeRole={onChangeRole} />
            ))}
          </ul>
        </div>
      )}
    </ModalOverlay>
  )
}

interface MemberRowProps {
  member: BoardMember
  onRemove: (id: string) => void
  onChangeRole: (id: string, role: WorkspaceRole) => void
}

function MemberRow({ member, onRemove, onChangeRole }: MemberRowProps) {
  const isOwner = member.role === 'owner'
  const isPending = member.status === 'pending'

  return (
    <li className={`flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${isPending ? 'opacity-60' : ''}`}>
      <Avatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {member.name}
          {isPending && (
            <span className="ml-1.5 text-xs text-gray-400">invited</span>
          )}
        </p>
        <p className="text-xs text-gray-400 truncate">{member.email}</p>
      </div>

      {isOwner ? (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASS[member.role]}`}>
          {ROLE_LABELS[member.role]}
        </span>
      ) : (
        <select
          value={member.role}
          onChange={(e) => onChangeRole(member.id, e.target.value as WorkspaceRole)}
          className="shrink-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      )}

      {!isOwner && (
        <button
          onClick={() => onRemove(member.id)}
          className="shrink-0 rounded p-0.5 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label={`Remove ${member.name}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </li>
  )
}
