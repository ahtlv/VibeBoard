export type TimeEntrySource = 'manual' | 'pomodoro' | 'tracker'

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
  source: TimeEntrySource
  note: string | null
}
