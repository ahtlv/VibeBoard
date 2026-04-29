import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { getBoardWorkspace, checkMembership } from '../lib/access'

export const tasksRouter = new Hono<AppEnv>()

tasksRouter.use('*', authMiddleware)

// ── helpers ───────────────────────────────────────────────────────────────────

async function syncAssignees(
  supabase: ReturnType<typeof getSupabase>,
  taskId: string,
  boardId: string,
  userIds: string[],
) {
  await supabase.from('task_assignees').delete().eq('task_id', taskId)
  if (userIds.length === 0) return
  const rows = userIds.map((user_id) => ({ task_id: taskId, user_id, board_id: boardId }))
  await supabase.from('task_assignees').insert(rows)
}

async function getAssigneeIds(
  supabase: ReturnType<typeof getSupabase>,
  taskId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from('task_assignees')
    .select('user_id')
    .eq('task_id', taskId)
  return (data ?? []).map((r) => r.user_id)
}

// ── POST /api/v1/tasks ────────────────────────────────────────────────────────

const createTaskSchema = z.object({
  board_id: z.string().uuid(),
  column_id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().nullable().optional(),
  bg_color: z.string().max(50).nullable().optional(),
  assignee_ids: z.array(z.string().uuid()).optional(),
})

tasksRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { board_id, column_id, title, description, priority, due_date, bg_color, assignee_ids } = parsed.data

  const workspaceId = await getBoardWorkspace(supabase, board_id)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)
  if (!await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

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
    .insert({
      board_id, column_id, title, position,
      created_by: userId,
      status: 'todo',
      priority: priority ?? 'medium',
      description: description ?? null,
      due_date: due_date ?? null,
      bg_color: bg_color ?? null,
    })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to create task' }, 500)

  if (assignee_ids && assignee_ids.length > 0) {
    await syncAssignees(supabase, data.id, board_id, assignee_ids)
  }

  return c.json({ ...data, assignee_ids: assignee_ids ?? [] }, 201)
})

// ── PATCH /api/v1/tasks/:id ───────────────────────────────────────────────────

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().nullable().optional(),
  bg_color: z.string().max(50).nullable().optional(),
  assignee_ids: z.array(z.string().uuid()).optional(),
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

  const { assignee_ids, ...taskFields } = parsed.data

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...taskFields, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to update task' }, 500)

  if (assignee_ids !== undefined) {
    await syncAssignees(supabase, taskId, data.board_id, assignee_ids)
  }

  const finalAssigneeIds = assignee_ids !== undefined
    ? assignee_ids
    : await getAssigneeIds(supabase, taskId)

  return c.json({ ...data, assignee_ids: finalAssigneeIds })
})

// ── DELETE /api/v1/tasks/:id ──────────────────────────────────────────────────

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

// ── PATCH /api/v1/tasks/:id/move ─────────────────────────────────────────────

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

  const assigneeIds = await getAssigneeIds(supabase, taskId)

  return c.json({ ...data, assignee_ids: assigneeIds })
})
