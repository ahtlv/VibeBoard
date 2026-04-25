import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { getBoardWorkspace, checkMembership } from '../lib/access'

export const tasksRouter = new Hono<AppEnv>()

tasksRouter.use('*', authMiddleware)

// POST /api/v1/tasks
const createTaskSchema = z.object({
  board_id: z.string().uuid(),
  column_id: z.string().uuid(),
  title: z.string().min(1).max(255),
})

tasksRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { board_id, column_id, title } = parsed.data

  const workspaceId = await getBoardWorkspace(supabase, board_id)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)
  if (!await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  // Позиция = конец колонки
  const { data: lastTask } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', column_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = lastTask ? lastTask.position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({ board_id, column_id, title, position, created_by: userId, status: 'todo', priority: 'medium' })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to create task' }, 500)

  return c.json(data, 201)
})

// PATCH /api/v1/tasks/:id
const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().nullable().optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' })

tasksRouter.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: task } = await supabase.from('tasks').select('board_id').eq('id', taskId).single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to update task' }, 500)

  return c.json(data)
})

// DELETE /api/v1/tasks/:id
tasksRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: task } = await supabase.from('tasks').select('board_id').eq('id', taskId).single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) return c.json({ error: error.message }, 500)

  return new Response(null, { status: 204 })
})

// PATCH /api/v1/tasks/:id/move
const moveTaskSchema = z.object({
  column_id: z.string().uuid(),
  position: z.number().int().min(0),
})

tasksRouter.patch('/:id/move', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: task } = await supabase.from('tasks').select('board_id, column_id, position').eq('id', taskId).single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = moveTaskSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { column_id, position } = parsed.data

  const { data, error } = await supabase
    .from('tasks')
    .update({ column_id, position, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to move task' }, 500)

  return c.json(data)
})
