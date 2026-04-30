import { BoardMembersStack } from './BoardMembersStack'
import type { BoardMember } from '@/entities/board/types'
import type { WorkspaceRole } from '@/shared/types/workspace'

interface BoardHeaderProps {
  boardName: string
  description: string | null
  members: BoardMember[]
  onInvite: (email: string, role: WorkspaceRole) => Promise<string | null>
  onRemove: (memberId: string) => void
  onChangeRole: (memberId: string, role: WorkspaceRole) => void
}

export function BoardHeader({
  boardName,
  description,
  members,
  onInvite,
  onRemove,
  onChangeRole,
}: BoardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{boardName}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">
        <BoardMembersStack
          members={members}
          onInvite={onInvite}
          onRemove={onRemove}
          onChangeRole={onChangeRole}
        />
      </div>
    </div>
  )
}
