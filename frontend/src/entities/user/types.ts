import type { Plan } from '@/shared/types/plan'

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  emailNotifications: boolean
  desktopNotifications: boolean
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  plan: Plan
  settings: UserSettings
  createdAt: string
}
