import { useState } from 'react'
import { Avatar } from '@/shared/ui/Avatar'
import { InviteMembersModal } from './InviteMembersModal'
import type { BoardMember } from '@/entities/board/types'
import type { WorkspaceRole } from '@/shared/types/workspace'

const MAX_VISIBLE = 4

interface BoardMembersStackProps {
  members: BoardMember[]
  onInvite: (email: string, role: WorkspaceRole) => Promise<string | null>
  onRemove: (memberId: string) => void
  onChangeRole: (memberId: string, role: WorkspaceRole) => void
}

export function BoardMembersStack({
  members,
  onInvite,
  onRemove,
  onChangeRole,
}: BoardMembersStackProps) {
  const [open, setOpen] = useState(false)

  const activeMembers = members.filter((m) => m.status === 'active')
  const visible = activeMembers.slice(0, MAX_VISIBLE)
  const overflow = activeMembers.length - MAX_VISIBLE

  return (
    <>
      <div className="flex items-center gap-2">
        {visible.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center"
            title="View members"
          >
            {visible.map((m, i) => (
              <span
                key={m.id}
                className="block ring-2 ring-white dark:ring-gray-950 rounded-full"
                style={{ marginLeft: i === 0 ? 0 : '-8px' }}
              >
                <Avatar name={m.name} avatarUrl={m.avatarUrl} size="sm" />
              </span>
            ))}
            {overflow > 0 && (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-950 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 select-none"
                style={{ marginLeft: '-8px' }}
              >
                +{overflow}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setOpen(true)}
          title="Invite members"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {open && (
        <InviteMembersModal
          members={members}
          onInvite={onInvite}
          onRemove={onRemove}
          onChangeRole={onChangeRole}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
