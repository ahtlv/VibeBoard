import { DailyGoalRing } from './DailyGoalRing'
import { formatTrackedTime } from '../lib/format'
import type { AnalyticsOverview } from '@/shared/api/analyticsApi'

interface TodayStatsProps {
  data: AnalyticsOverview | null
}

export function TodayStats({ data }: TodayStatsProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-base">✅</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{data?.completedTasks ?? 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-base">⏱</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatTrackedTime(data?.totalTrackedSeconds ?? 0)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-base">🔥</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{data?.currentStreakDays ?? 0}</span>
        </div>
      </div>
      <DailyGoalRing
        current={data?.pomodoroSessionsCount ?? 0}
        goal={data?.dailyPomodoroGoal ?? 8}
        size={52}
      />
    </div>
  )
}
