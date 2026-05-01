import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { getBoardWorkspace, checkMembership } from '../lib/access'
import { timeEntriesService } from '../services/timeEntriesService'
import { achievementsService } from '../services/achievementsService'

export const timeEntriesRouter = new Hono<AppEnv>()

timeEntriesRouter.use('*', authMiddleware)

// POST /api/v1/time-entries — старт таймера (task_id опционален для quick-start)
const startSchema = z.object({
  task_id: z.string().uuid().nullable().optional(),
  source: z.enum(['timer', 'pomodoro']).default('pomodoro'),
})

timeEntriesRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => ({}))
  const parsed = startSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { task_id, source } = parsed.data

  // Проверяем доступ только если задача указана
  if (task_id) {
    const { data: task } = await supabase.from('tasks').select('board_id').eq('id', task_id).single()
    if (!task) return c.json({ error: 'Task not found' }, 404)

    const workspaceId = await getBoardWorkspace(supabase, task.board_id)
    if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
      return c.json({ error: 'Not a member of this workspace' }, 403)
    }
  }

  // Останавливаем предыдущий активный таймер
  await timeEntriesService.stop(supabase, userId)

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id: task_id ?? null,
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

// GET /api/v1/time-entries/active — текущая активная сессия
timeEntriesRouter.get('/active', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const entry = await timeEntriesService.getActive(supabase, userId)
  return c.json(entry)
})

// POST /api/v1/time-entries/pause
timeEntriesRouter.post('/pause', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const data = await timeEntriesService.pause(supabase, userId).catch(() => null)
  if (!data) return c.json({ error: 'No active timer' }, 404)
  return c.json(data)
})

// POST /api/v1/time-entries/resume
timeEntriesRouter.post('/resume', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const data = await timeEntriesService.resume(supabase, userId).catch(() => null)
  if (!data) return c.json({ error: 'No active timer' }, 404)
  return c.json(data)
})

// POST /api/v1/time-entries/stop
timeEntriesRouter.post('/stop', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const data = await timeEntriesService.stop(supabase, userId).catch(() => null)
  if (!data) return c.json({ error: 'No active timer' }, 404)
  const unlocked_achievements = await achievementsService.evaluateAndUnlock(supabase, userId)
  return c.json({ ...data, unlocked_achievements })
})
