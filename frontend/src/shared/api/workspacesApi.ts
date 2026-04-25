import { apiClient } from './client'

export interface WorkspaceResponse {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export interface InvitationResponse {
  id: string
  workspace_id: string
  invited_by: string | null
  email: string
  role: string
  status: string
  expires_at: string
  created_at: string
}

export const workspacesApi = {
  /** GET /workspaces — список workspace текущего пользователя */
  listWorkspaces: (): Promise<WorkspaceResponse[]> =>
    apiClient.get<WorkspaceResponse[]>('/workspaces'),

  /** POST /workspaces — создать новый workspace */
  createWorkspace: (body: { name: string; description?: string }): Promise<WorkspaceResponse> =>
    apiClient.post<WorkspaceResponse>('/workspaces', body),

  /** GET /workspaces/:id/members — список участников */
  listMembers: (workspaceId: string): Promise<WorkspaceMember[]> =>
    apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),

  /** POST /workspaces/:id/invite — пригласить участника */
  invite: (
    workspaceId: string,
    body: { email: string; role: 'member' | 'admin' },
  ): Promise<InvitationResponse> =>
    apiClient.post<InvitationResponse>(`/workspaces/${workspaceId}/invite`, body),
}
