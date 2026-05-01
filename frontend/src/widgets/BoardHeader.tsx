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
  pendingReviewCount?: number
  onOpenReview?: () => void
}

export function BoardHeader({
  boardName,
  description,
  members,
  onInvite,
  onRemove,
  onChangeRole,
  pendingReviewCount = 0,
  onOpenReview,
}: BoardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{boardName}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="shrink-0 pt-0.5 flex items-center gap-3">
        {pendingReviewCount > 0 && (
          <button
            onClick={onOpenReview}
            className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
          >
            <span>👁</span>
            <span>{pendingReviewCount} на проверке</span>
          </button>
        )}
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
