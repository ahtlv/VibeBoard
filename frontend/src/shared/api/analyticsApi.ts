import { apiClient } from './client'

// ── response DTOs ─────────────────────────────────────────────────────────────

/** Бесплатная сводка — доступна всем тарифам */
export interface AnalyticsOverview {
  completedTasks: number
  totalTrackedSeconds: number
  currentStreakDays: number
  pomodoroSessionsCount: number
}

/** Детальная продуктивность — Pro / Team */
export interface DailyProductivity {
  date: string           // ISO date, e.g. "2026-04-08"
  completedTasks: number
  trackedSeconds: number
  pomodoroSessions: number
}

export interface ProductivityStats {
  periodDays: number
  daily: DailyProductivity[]
  topLabels: Array<{ labelId: string; title: string; color: string; taskCount: number }>
  completionRate: number  // 0–1
}

// ── query params ──────────────────────────────────────────────────────────────

export interface ProductivityStatsParams {
  workspaceId?: string
  boardId?: string
  /** ISO date string, e.g. "2026-03-01" */
  from?: string
  /** ISO date string */
  to?: string
}

// ── api ───────────────────────────────────────────────────────────────────────

export const analyticsApi = {
  /** GET /analytics/overview — общая сводка для текущего пользователя */
  getOverview: (): Promise<AnalyticsOverview> =>
    apiClient.get<AnalyticsOverview>('/analytics/overview'),

  /** GET /analytics/productivity — детальная аналитика (Pro/Team) */
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
