import { apiClient } from './client'

// ── response DTOs ─────────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  completedTasks: number
  totalTrackedSeconds: number
  currentStreakDays: number
  pomodoroSessionsCount: number
  dailyPomodoroGoal: number
}

export interface DailyProductivity {
  date: string
  completedTasks: number
  trackedSeconds: number
  pomodoroSessions: number
}

export interface ProductivityStats {
  periodDays: number
  daily: DailyProductivity[]
  topLabels: Array<{ labelId: string; title: string; color: string; taskCount: number }>
  completionRate: number
}

export interface ProductivityStatsParams {
  workspaceId?: string
  boardId?: string
  from?: string
  to?: string
}

// ── api ───────────────────────────────────────────────────────────────────────

interface OverviewRaw {
  tasks_done: number
  total_tracked_time: number
  pomodoro_sessions: number
  current_streak_days: number
  daily_pomodoro_goal: number
}

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const raw = await apiClient.get<OverviewRaw>('/analytics/overview')
    return {
      completedTasks: raw.tasks_done,
      totalTrackedSeconds: raw.total_tracked_time,
      pomodoroSessionsCount: raw.pomodoro_sessions,
      currentStreakDays: raw.current_streak_days,
      dailyPomodoroGoal: raw.daily_pomodoro_goal,
    }
  },

  getProductivityStats: (params?: ProductivityStatsParams): Promise<ProductivityStats> => {
    const query = new URLSearchParams()
    if (params?.workspaceId) query.set('workspace_id', params.workspaceId)
    if (params?.boardId)     query.set('board_id', params.boardId)
    if (params?.from)        query.set('from', params.from)
    if (params?.to)          query.set('to', params.to)

    const qs = query.toString()
    return apiClient.get<ProductivityStats>(`/analytics/productivity${qs ? `?${qs}` : ''}`)
  },
}
