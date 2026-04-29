import type { Task } from '@/entities/task/types'
import type { Label } from '@/entities/label/types'
import type { WorkspaceRole } from '@/shared/types/workspace'

export type BoardMemberStatus = 'active' | 'pending'

export interface BoardMember {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl?: string | null
  role: WorkspaceRole
  status: BoardMemberStatus
  joinedAt: string
}

export interface Column {
  id: string
  boardId: string
  title: string
  position: number
  color?: string | null
  tasks: Task[]
}

export interface Board {
  id: string
  workspaceId: string
  title: string
  description: string | null
  columns: Column[]
  labels: Label[]
  members?: BoardMember[]
  createdAt: string
  updatedAt: string
}
