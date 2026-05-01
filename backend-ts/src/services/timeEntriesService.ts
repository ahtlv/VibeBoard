import type { SupabaseClient } from '@supabase/supabase-js'

export interface ActiveTimeEntry {
  id: string
  task_id: string
  user_id: string
  started_at: string
  paused_at: string | null
  accumulated_seconds: number
  source: string
  status: string
}

export const timeEntriesService = {
  async getActive(supabase: SupabaseClient, userId: string): Promise<ActiveTimeEntry | null> {
    const { data } = await supabase
      .from('time_entries')
      .select('id, task_id, user_id, started_at, paused_at, accumulated_seconds, source, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    return data ?? null
  },

  async pause(supabase: SupabaseClient, userId: string) {
    const { data: active } = await supabase
      .from('time_entries')
      .select('id, started_at, accumulated_seconds, paused_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!active) return null
    if (active.paused_at) return active // already paused

    const now = new Date().toISOString()
    const elapsed = Math.floor((Date.now() - new Date(active.started_at).getTime()) / 1000)

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        paused_at: now,
        accumulated_seconds: active.accumulated_seconds + elapsed,
      })
      .eq('id', active.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async resume(supabase: SupabaseClient, userId: string) {
    const { data: active } = await supabase
      .from('time_entries')
      .select('id, paused_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!active) return null
    if (!active.paused_at) return active // already running

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        paused_at: null,
        started_at: new Date().toISOString(),
      })
      .eq('id', active.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async stop(supabase: SupabaseClient, userId: string) {
    const { data: active } = await supabase
      .from('time_entries')
      .select('id, task_id, started_at, paused_at, accumulated_seconds, source')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!active) return null

    const now = new Date()
    const runningSeconds = active.paused_at
      ? 0
      : Math.floor((now.getTime() - new Date(active.started_at).getTime()) / 1000)
    const totalSeconds = active.accumulated_seconds + runningSeconds

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'completed',
        ended_at: now.toISOString(),
        duration_seconds: totalSeconds,
        paused_at: null,
      })
      .eq('id', active.id)
      .select()
      .single()

    if (error) throw error

    // Update task tracked time
    const { data: taskData } = await supabase
      .from('tasks')
      .select('tracked_time_total, pomodoro_sessions_count')
      .eq('id', active.task_id)
      .single()

    if (taskData && active.task_id) {
      await supabase.from('tasks').update({
        tracked_time_total: (taskData.tracked_time_total ?? 0) + totalSeconds,
        pomodoro_sessions_count: active.source === 'pomodoro'
          ? (taskData.pomodoro_sessions_count ?? 0) + 1
          : taskData.pomodoro_sessions_count,
      }).eq('id', active.task_id)
    }

    return data
  },
}
