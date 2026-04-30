import { apiClient } from './client'
import type { User } from '@/entities/user/types'

export interface UserSearchResult {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

export interface UpdateSettingsPayload {
  language?: string
  theme?: string
  email_notifications?: boolean
  desktop_notifications?: boolean
}

export const usersApi = {
  search: (q: string): Promise<UserSearchResult[]> =>
    apiClient.get<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}`),

  updateSettings: (payload: UpdateSettingsPayload): Promise<User> =>
    apiClient.patch<User>('/users/me/settings', payload),
}
