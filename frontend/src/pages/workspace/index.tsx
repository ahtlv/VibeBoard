import { AppShell } from '@/shared/ui/AppShell'
import type { WorkspaceRole } from '@/shared/types/workspace'

// ── mock data ─────────────────────────────────────────────────────────────────

interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: WorkspaceRole
  avatarUrl: string | null
  joinedAt: string
}

const MOCK_MEMBERS: WorkspaceMember[] = [
  {
    id: 'user-1',
    name: 'Anatoli',
    email: 'anatoli@vibeboard.app',
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

// ── helpers ───────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<WorkspaceRole, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── component ─────────────────────────────────────────────────────────────────

export function WorkspacePage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Workspace</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {MOCK_MEMBERS.length} members
          </p>
        </div>
        {/* TODO: подключить workspacesApi.invite() */}
        <button
          onClick={() => console.log('TODO: open invite modal')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + Invite member
        </button>
      </div>

      <div className="max-w-3xl">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Member
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Email
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Role
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Joined
            </span>
          </div>

          {/* Rows */}
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {MOCK_MEMBERS.map((member) => (
              <li
                key={member.id}
                className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 px-6 py-4"
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {initials(member.name)}
                    </span>
                  </div>
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {member.name}
                  </span>
                </div>

                {/* Email */}
                <span className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </span>

                {/* Role badge */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[member.role]}`}
                >
                  {member.role}
                </span>

                {/* Joined date */}
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatDate(member.joinedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
