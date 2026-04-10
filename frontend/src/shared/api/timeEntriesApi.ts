import { apiClient } from './client'

export interface TimeEntryResponse {
  id: string
  task_id: string
  user_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: 'active' | 'completed' | 'cancelled'
  source: string
  note: string | null
  created_at: string
}

export const timeEntriesApi = {
  /** POST /time-entries/start — начать отслеживание времени для задачи */
  start: (taskId: string): Promise<TimeEntryResponse> =>
    apiClient.post<TimeEntryResponse>('/time-entries/start', {
      task_id: taskId,
      source: 'pomodoro',
    }),

  /** POST /time-entries/stop — завершить активную сессию */
  stop: (): Promise<TimeEntryResponse> =>
    apiClient.post<TimeEntryResponse>('/time-entries/stop'),
}
