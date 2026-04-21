import { type FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '@/shared/ui/AppShell'
import { ApiError } from '@/shared/api/client'
import { workspacesApi } from '@/shared/api/workspacesApi'
import type { WorkspaceRole } from '@/shared/types/workspace'

// ── types ─────────────────────────────────────────────────────────────────────

interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: WorkspaceRole
  avatarUrl: string | null
  joinedAt: string
}

interface MockTask {
  id: string
  title: string
  assigneeId: string
  transferredFrom?: string // name of previous assignee
}

// ── mock data ─────────────────────────────────────────────────────────────────

const INITIAL_MEMBERS: WorkspaceMember[] = [
  {
    id: 'user-1',
    name: 'Anatoli',
    email: 'anatoli@vibeboard.app',
    role: 'owner',
    avatarUrl: null,
    joinedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-0',
    name: 'Anatoli Hotulev',
    email: 'anatoli.hotulev@gmail.com',
    role: 'owner',
    avatarUrl: null,
    joinedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Maria Ivanova',
    email: 'maria@vibeboard.app',
    role: 'admin',
    avatarUrl: null,
    joinedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Alex Petrov',
    email: 'alex@vibeboard.app',
    role: 'member',
    avatarUrl: null,
    joinedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Dana Kim',
    email: 'dana@vibeboard.app',
    role: 'member',
    avatarUrl: null,
    joinedAt: '2026-04-01T00:00:00Z',
  },
]

const INITIAL_TASKS: MockTask[] = [
  { id: 't-1', title: 'Review Q1 report', assigneeId: 'user-2' },
  { id: 't-2', title: 'Update API docs', assigneeId: 'user-2' },
  { id: 't-3', title: 'Fix login bug', assigneeId: 'user-3' },
  { id: 't-4', title: 'Deploy staging', assigneeId: 'user-3' },
  { id: 't-5', title: 'Design onboarding flow', assigneeId: 'user-4' },
]

// ── helpers ───────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<WorkspaceRole, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── transfer modal ─────────────────────────────────────────────────────────────

interface TransferModalProps {
  removingMember: WorkspaceMember
  candidates: WorkspaceMember[]
  taskCount: number
  onConfirm: (transferToId: string) => void
  onCancel: () => void
}

function TransferModal({ removingMember, candidates, taskCount, onConfirm, onCancel }: TransferModalProps) {
  const [transferToId, setTransferToId] = useState(candidates[0]?.id ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Remove {removingMember.name}?
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {taskCount > 0
            ? `${removingMember.name} has ${taskCount} task${taskCount !== 1 ? 's' : ''} assigned. Choose who to transfer them to:`
            : `${removingMember.name} has no assigned tasks. They will be removed immediately.`}
        </p>

        {taskCount > 0 && candidates.length > 0 && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Transfer tasks to
            </label>
            <select
              value={transferToId}
              onChange={(e) => setTransferToId(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {candidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(transferToId)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Remove member
          </button>
        </div>
      </div>
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

// Current user is owner (hardcoded for mock — в реальности берётся из auth store)
const CURRENT_USER_ROLE: WorkspaceRole = 'owner'

export function WorkspacePage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>(INITIAL_MEMBERS)
  const [tasks, setTasks] = useState<MockTask[]>(INITIAL_TASKS)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [submitting, setSubmitting] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<WorkspaceMember | null>(null)

  useEffect(() => {
    let cancelled = false
    workspacesApi.listWorkspaces().then((list) => {
      if (!cancelled && list.length > 0) setWorkspaceId(list[0].id)
    })
    return () => { cancelled = true }
  }, [])

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!workspaceId || !email.trim()) return
    setSubmitting(true)
    try {
      await workspacesApi.invite(workspaceId, { email: email.trim(), role })
      toast.success(`Invitation sent to ${email.trim()}`)
      setEmail('')
      setRole('member')
      setShowInviteForm(false)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send invitation'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    setEmail('')
    setRole('member')
    setShowInviteForm(false)
  }

  function handleRemoveClick(member: WorkspaceMember) {
    setPendingRemove(member)
  }

  function handleTransferConfirm(transferToId: string) {
    if (!pendingRemove) return
    const removedName = pendingRemove.name
    const transferTarget = members.find((m) => m.id === transferToId)

    // Transfer tasks
    setTasks((prev) =>
      prev.map((t) =>
        t.assigneeId === pendingRemove.id
          ? { ...t, assigneeId: transferToId, transferredFrom: removedName }
          : t
      )
    )

    // Remove member
    setMembers((prev) => prev.filter((m) => m.id !== pendingRemove.id))

    const transferredCount = tasks.filter((t) => t.assigneeId === pendingRemove.id).length
    if (transferredCount > 0 && transferTarget) {
      toast.success(
        `${removedName} removed. ${transferredCount} task${transferredCount !== 1 ? 's' : ''} transferred to ${transferTarget.name}.`
      )
    } else {
      toast.success(`${removedName} has been removed from the workspace.`)
    }

    setPendingRemove(null)
  }

  const transferCandidates = pendingRemove
    ? members.filter((m) => m.id !== pendingRemove.id)
    : []

  const pendingTaskCount = pendingRemove
    ? tasks.filter((t) => t.assigneeId === pendingRemove.id).length
    : 0

  return (
    <AppShell>
      {pendingRemove && (
        <TransferModal
          removingMember={pendingRemove}
          candidates={transferCandidates}
          taskCount={pendingTaskCount}
          onConfirm={handleTransferConfirm}
          onCancel={() => setPendingRemove(null)}
        />
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Workspace</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showInviteForm && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            + Invite member
          </button>
        )}
      </div>

      {showInviteForm && (
        <div className="mb-6 max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Invite a new member
          </h2>
          <form onSubmit={handleInvite} className="flex flex-col gap-3">
            <div>
              <label htmlFor="invite-email" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                disabled={submitting}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
                disabled={submitting}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Send invite'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="max-w-3xl">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Member</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Email</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Role</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Joined</span>
            <span />
          </div>

          {/* Rows */}
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.length === 0 && (
              <li className="flex flex-col items-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-2xl select-none">
                  👥
                </div>
                <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">No members yet</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Invite teammates to collaborate on this workspace
                </p>
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  + Invite member
                </button>
              </li>
            )}
            {members.map((member) => {
              const memberTasks = tasks.filter((t) => t.assigneeId === member.id)
              const canRemove = CURRENT_USER_ROLE === 'owner' && member.role !== 'owner'
              return (
                <li
                  key={member.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-6 py-4"
                >
                  {/* Name + avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {initials(member.name)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </span>
                      {memberTasks.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {memberTasks.length} task{memberTasks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <span className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </span>

                  {/* Role badge */}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[member.role]}`}>
                    {member.role}
                  </span>

                  {/* Joined date */}
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatDate(member.joinedAt)}
                  </span>

                  {/* Remove button */}
                  <div className="flex justify-end">
                    {canRemove ? (
                      <button
                        onClick={() => handleRemoveClick(member)}
                        title="Remove member"
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Transferred tasks panel */}
        {tasks.some((t) => t.transferredFrom) && (
          <div className="mt-6 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4">
            <h2 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-400">
              Transferred tasks
            </h2>
            <ul className="space-y-2">
              {tasks.filter((t) => t.transferredFrom).map((t) => {
                const assignee = members.find((m) => m.id === t.assigneeId)
                return (
                  <li key={t.id} className="flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-amber-200 dark:bg-amber-800/60 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                      transferred from {t.transferredFrom}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{t.title}</span>
                    {assignee && (
                      <span className="text-gray-400 dark:text-gray-500">→ {assignee.name}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  )
}
