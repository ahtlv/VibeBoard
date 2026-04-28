import { apiClient } from './client'

export interface UserSearchResult {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

export const usersApi = {
  search: (q: string): Promise<UserSearchResult[]> =>
    apiClient.get<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}`),
}
