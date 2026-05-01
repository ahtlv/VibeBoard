import { useState, useEffect, useCallback } from 'react'
import { analyticsApi, type AnalyticsOverview } from '@/shared/api/analyticsApi'
import { pomodoroEvents } from '@/shared/lib/pomodoroEvents'

const POLL_INTERVAL = 30_000

export function useTodayStats() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => {
    analyticsApi.getOverview()
      .then(setData)
      .catch(() => {/* silent */})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, POLL_INTERVAL)
    const offStop = pomodoroEvents.on('pomodoroStop', fetch)
    const offTask = pomodoroEvents.on('taskDone', fetch)
    return () => {
      clearInterval(interval)
      offStop()
      offTask()
    }
  }, [fetch])

  return { data, loading }
}
