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

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  sixtyDaysAgo.setHours(0, 0, 0, 0)

  const [
    { count: tasksDone },
    { data: entries },
    { data: pomoDates },
    { data: taskDates },
    { data: userRow },
  ] = await Promise.all([
    supabase.from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('status', 'done')
      .gte('completed_at', todayISO),

    supabase.from('time_entries')
      .select('duration_seconds, source')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', todayISO),

    supabase.from('time_entries')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', sixtyDaysAgo.toISOString()),

    supabase.from('tasks')
      .select('completed_at')
      .eq('created_by', userId)
      .eq('status', 'done')
      .gte('completed_at', sixtyDaysAgo.toISOString()),

    supabase.from('users')
      .select('daily_pomodoro_goal')
      .eq('id', userId)
      .single(),
  ])

  const totalTrackedTime = (entries ?? []).reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
  const pomodoroSessions = (entries ?? []).filter(e => e.source === 'pomodoro').length

  // Compute streak
  const activeDays = new Set<string>()
  for (const e of pomoDates ?? []) activeDays.add(e.started_at.slice(0, 10))
  for (const t of taskDates ?? []) if (t.completed_at) activeDays.add(t.completed_at.slice(0, 10))

  let streakDays = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (activeDays.has(key)) {
      streakDays++
    } else if (i > 0) {
      break
    }
  }

  return c.json({
    tasks_done: tasksDone ?? 0,
    total_tracked_time: totalTrackedTime,
    pomodoro_sessions: pomodoroSessions,
    current_streak_days: streakDays,
    daily_pomodoro_goal: userRow?.daily_pomodoro_goal ?? 8,
  })
})
