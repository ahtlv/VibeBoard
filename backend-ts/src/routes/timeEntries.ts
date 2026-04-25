import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { getBoardWorkspace, checkMembership } from '../lib/access'

export const timeEntriesRouter = new Hono<AppEnv>()

timeEntriesRouter.use('*', authMiddleware)

// POST /api/v1/time-entries — старт таймера
const startSchema = z.object({
  task_id: z.string().uuid(),
  source: z.enum(['timer', 'pomodoro']),
})

timeEntriesRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = startSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { task_id, source } = parsed.data

  // Проверяем доступ к задаче
  const { data: task } = await supabase.from('tasks').select('board_id').eq('id', task_id).single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  // Останавливаем предыдущий активный таймер если есть
  const { data: active } = await supabase
    .from('time_entries')
    .select('id, started_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (active) {
    const duration = Math.floor((Date.now() - new Date(active.started_at).getTime()) / 1000)
    await supabase.from('time_entries').update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    }).eq('id', active.id)
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id,
      user_id: userId,
      source,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to start timer' }, 500)

  return c.json(data, 201)
})

// POST /api/v1/time-entries/stop — стоп активного таймера
timeEntriesRouter.post('/stop', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const { data: active } = await supabase
    .from('time_entries')
    .select('id, task_id, started_at, source')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!active) return c.json({ error: 'No active timer' }, 404)

  const duration = Math.floor((Date.now() - new Date(active.started_at).getTime()) / 1000)
  const endedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from('time_entries')
    .update({ status: 'completed', ended_at: endedAt, duration_seconds: duration })
    .eq('id', active.id)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to stop timer' }, 500)

  // Обновляем tracked_time_total в задаче
  const { data: taskData } = await supabase.from('tasks').select('tracked_time_total').eq('id', active.task_id).single()
  if (taskData) {
    await supabase.from('tasks').update({
      tracked_time_total: (taskData.tracked_time_total ?? 0) + duration
    }).eq('id', active.task_id)
  }

  return c.json(data)
})
