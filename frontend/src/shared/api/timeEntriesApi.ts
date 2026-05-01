import { apiClient } from './client'

export interface TimeEntryResponse {
  id: string
  task_id: string | null
  user_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  paused_at: string | null
  accumulated_seconds: number
  status: 'active' | 'completed' | 'cancelled'
  source: string
  note: string | null
  created_at: string
}

export interface StopResponse extends TimeEntryResponse {
  unlocked_achievements: AchievementUnlock[]
}

export interface AchievementUnlock {
  id: string
  title: string
  description: string
  icon: string
  unlocked_at: string
}

export const timeEntriesApi = {
  /** POST /time-entries — начать pomodoro-сессию (task_id опционален для quick-start) */
  start: (taskId?: string | null, source: 'pomodoro' | 'timer' = 'pomodoro'): Promise<TimeEntryResponse> =>
    apiClient.post<TimeEntryResponse>('/time-entries', {
      task_id: taskId ?? null,
      source,
    }),

  /** GET /time-entries/active — текущая активная сессия или null */
  getActive: (): Promise<TimeEntryResponse | null> =>
    apiClient.get<TimeEntryResponse | null>('/time-entries/active'),

  /** POST /time-entries/pause */
  pause: (): Promise<TimeEntryResponse> =>
    apiClient.post<TimeEntryResponse>('/time-entries/pause'),

  /** POST /time-entries/resume */
  resume: (): Promise<TimeEntryResponse> =>
    apiClient.post<TimeEntryResponse>('/time-entries/resume'),

  /** POST /time-entries/stop */
  stop: (): Promise<StopResponse> =>
    apiClient.post<StopResponse>('/time-entries/stop'),
}
