import { apiClient } from './client'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  metric: string
  threshold: number
  progress: number
  unlocked_at: string | null
}

export const achievementsApi = {
  list: (): Promise<Achievement[]> =>
    apiClient.get<Achievement[]>('/achievements'),
}
