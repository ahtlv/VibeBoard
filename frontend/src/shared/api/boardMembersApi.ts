import { apiClient } from './client'
import type { BoardMember } from '@/entities/board/types'
import type { WorkspaceRole } from '@/shared/types/workspace'

export interface BoardMemberResponse {
  id: string
  boardId: string
  userId: string | null
  email: string
  name: string
  avatarUrl: string | null
  role: WorkspaceRole
  status: 'active' | 'pending'
  joinedAt: string
}

function mapMember(m: BoardMemberResponse): BoardMember {
  return {
    id: m.id,
    userId: m.userId ?? '',
    email: m.email,
    name: m.name,
    avatarUrl: m.avatarUrl,
    role: m.role,
    status: m.status,
    joinedAt: m.joinedAt,
  }
}

export const boardMembersApi = {
  list: async (boardId: string): Promise<BoardMember[]> => {
    const data = await apiClient.get<BoardMemberResponse[]>(`/boards/${boardId}/members`)
    return data.map(mapMember)
  },

  add: async (boardId: string, email: string, role: 'admin' | 'member'): Promise<BoardMember> => {
    const data = await apiClient.post<BoardMemberResponse>(`/boards/${boardId}/members`, { email, role })
    return mapMember(data)
  },

  updateRole: async (boardId: string, memberId: string, role: 'admin' | 'member'): Promise<void> => {
    await apiClient.patch(`/boards/${boardId}/members/${memberId}`, { role })
  },

  remove: async (boardId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/members/${memberId}`)
  },
}
