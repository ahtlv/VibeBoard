import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

export const analyticsRouter = new Hono<AppEnv>()

analyticsRouter.use('*', authMiddleware)

// GET /api/v1/analytics/overview
analyticsRouter.get('/overview', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayISO = todayStart.toISOString()

  // Задачи выполненные сегодня
  const { count: tasksDone } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', userId)
    .eq('status', 'done')
    .gte('updated_at', todayISO)

  // Time entries за сегодня
  const { data: entries } = await supabase
    .from('time_entries')
    .select('duration_seconds, source')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('started_at', todayISO)

  const totalTrackedTime = (entries ?? []).reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
  const pomodoroSessions = (entries ?? []).filter(e => e.source === 'pomodoro').length

  return c.json({
    tasks_done: tasksDone ?? 0,
    total_tracked_time: totalTrackedTime,
    pomodoro_sessions: pomodoroSessions,
  })
})
