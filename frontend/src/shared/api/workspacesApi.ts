import { apiClient } from './client'

export interface WorkspaceResponse {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export const workspacesApi = {
  /** GET /workspaces — список workspace текущего пользователя */
  listWorkspaces: (): Promise<WorkspaceResponse[]> =>
    apiClient.get<WorkspaceResponse[]>('/workspaces'),

  /** POST /workspaces — создать новый workspace */
  createWorkspace: (body: { name: string; description?: string }): Promise<WorkspaceResponse> =>
    apiClient.post<WorkspaceResponse>('/workspaces', body),
}
