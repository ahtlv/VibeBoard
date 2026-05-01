import type { SupabaseClient } from '@supabase/supabase-js'

export interface AchievementDto {
  id: string
  title: string
  description: string
  icon: string
  metric: string
  threshold: number
  progress: number
  unlocked_at: string | null
}

interface Metrics {
  pomodoro_total: number
  streak_days: number
  tasks_total: number
  today_pomodoros: number
  daily_goal: number
}

async function computeMetrics(supabase: SupabaseClient, userId: string): Promise<Metrics> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ count: pomodoroTotal }, { count: tasksTotal }, { data: todayEntries }, { data: userRow }] =
    await Promise.all([
      supabase.from('time_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('source', 'pomodoro')
        .eq('status', 'completed'),

      supabase.from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'done'),

      supabase.from('time_entries')
        .select('started_at')
        .eq('user_id', userId)
        .eq('source', 'pomodoro')
        .eq('status', 'completed')
        .gte('started_at', todayStart.toISOString()),

      supabase.from('users')
        .select('daily_pomodoro_goal')
        .eq('id', userId)
        .single(),
    ])

  const dailyGoal = userRow?.daily_pomodoro_goal ?? 8
  const todayPomodoros = todayEntries?.length ?? 0

  // Compute streak: check last 60 days for activity (pomodoro or done-task)
  const streakDays = await computeStreak(supabase, userId)

  return {
    pomodoro_total: pomodoroTotal ?? 0,
    streak_days: streakDays,
    tasks_total: tasksTotal ?? 0,
    today_pomodoros: todayPomodoros,
    daily_goal: todayPomodoros >= dailyGoal ? 1 : 0,
  }
}

async function computeStreak(supabase: SupabaseClient, userId: string): Promise<number> {
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  sixtyDaysAgo.setHours(0, 0, 0, 0)

  const [{ data: pomoDates }, { data: taskDates }] = await Promise.all([
    supabase.from('time_entries')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', sixtyDaysAgo.toISOString()),

    supabase.from('tasks')
      .select('updated_at')
      .eq('created_by', userId)
      .eq('status', 'done')
      .gte('updated_at', sixtyDaysAgo.toISOString()),
  ])

  const activeDays = new Set<string>()
  for (const e of pomoDates ?? []) activeDays.add(e.started_at.slice(0, 10))
  for (const t of taskDates ?? []) activeDays.add(t.updated_at.slice(0, 10))

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (activeDays.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

export const achievementsService = {
  async list(supabase: SupabaseClient, userId: string): Promise<AchievementDto[]> {
    const [{ data: catalog }, { data: userProgress }, metrics] = await Promise.all([
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('*').eq('user_id', userId),
      computeMetrics(supabase, userId),
    ])

    const progressMap = new Map((userProgress ?? []).map((r) => [r.achievement_id, r]))

    return (catalog ?? []).map((a) => {
      const row = progressMap.get(a.id)
      const progress = metrics[a.metric as keyof Metrics] ?? 0
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        metric: a.metric,
        threshold: a.threshold,
        progress,
        unlocked_at: row?.unlocked_at ?? null,
      }
    })
  },

  async evaluateAndUnlock(supabase: SupabaseClient, userId: string): Promise<AchievementDto[]> {
    const [{ data: catalog }, metrics] = await Promise.all([
      supabase.from('achievements').select('*'),
      computeMetrics(supabase, userId),
    ])

    const justUnlocked: AchievementDto[] = []

    for (const a of catalog ?? []) {
      const progress = metrics[a.metric as keyof Metrics] ?? 0
      if (progress < a.threshold) continue

      const { data: existing } = await supabase
        .from('user_achievements')
        .select('unlocked_at')
        .eq('user_id', userId)
        .eq('achievement_id', a.id)
        .single()

      if (existing?.unlocked_at) continue

      await supabase.from('user_achievements').upsert({
        user_id: userId,
        achievement_id: a.id,
        progress,
        unlocked_at: new Date().toISOString(),
      }, { onConflict: 'user_id,achievement_id' })

      justUnlocked.push({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        metric: a.metric,
        threshold: a.threshold,
        progress,
        unlocked_at: new Date().toISOString(),
      })
    }

    return justUnlocked
  },
}
