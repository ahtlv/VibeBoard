import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { getBoardWorkspace, checkMembership } from '../lib/access'
import { achievementsService } from '../services/achievementsService'

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

  const now = new Date().toISOString()
  const completedAtPatch =
    taskFields.status === 'done' ? { completed_at: now }
    : taskFields.status !== undefined ? { completed_at: null }
    : {}

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...taskFields, ...completedAtPatch, updated_at: now })
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

  const unlocked_achievements = parsed.data.status === 'done'
    ? await achievementsService.evaluateAndUnlock(supabase, userId)
    : []

  return c.json({ ...data, assignee_ids: finalAssigneeIds, unlocked_achievements })
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

// ── POST /api/v1/tasks/:id/submit-review ─────────────────────────────────────
// Any member/assignee/creator can submit a task for review

tasksRouter.post('/:id/submit-review', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: task } = await supabase
    .from('tasks')
    .select('board_id, status, created_by')
    .eq('id', taskId)
    .single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }
  if (task.status === 'done' || task.status === 'in_review') {
    return c.json({ error: 'Task cannot be submitted in current status' }, 422)
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'in_review', submitted_at: now, updated_at: now })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to submit task' }, 500)
  const assignee_ids = await getAssigneeIds(supabase, taskId)
  return c.json({ ...data, assignee_ids })
})

// ── POST /api/v1/tasks/:id/approve ───────────────────────────────────────────
// Admin/owner only: accept task → status='done', completed_at=now()

tasksRouter.post('/:id/approve', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: task } = await supabase
    .from('tasks')
    .select('board_id, status')
    .eq('id', taskId)
    .single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  const membership = workspaceId ? await checkMembership(supabase, workspaceId, userId) : null
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Only admins can approve tasks' }, 403)
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: now, updated_at: now })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to approve task' }, 500)

  const assignee_ids = await getAssigneeIds(supabase, taskId)
  const unlocked_achievements = await achievementsService.evaluateAndUnlock(supabase, userId)
  return c.json({ ...data, assignee_ids, unlocked_achievements })
})

// ── POST /api/v1/tasks/:id/reject ────────────────────────────────────────────
// Admin/owner only: send task back to in_progress

tasksRouter.post('/:id/reject', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: task } = await supabase
    .from('tasks')
    .select('board_id')
    .eq('id', taskId)
    .single()
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, task.board_id)
  const membership = workspaceId ? await checkMembership(supabase, workspaceId, userId) : null
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Only admins can reject tasks' }, 403)
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'in_progress', submitted_at: null, updated_at: now })
    .eq('id', taskId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to reject task' }, 500)
  const assignee_ids = await getAssigneeIds(supabase, taskId)
  return c.json({ ...data, assignee_ids })
})

// ── GET /api/v1/tasks/heatmap?workspace_id=X ─────────────────────────────────
// Returns daily task-completion counts for the last 365 days.
// Members see only their own tasks; admins see all workspace tasks.

tasksRouter.get('/heatmap', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)

  const supabase = getSupabase(c.env)
  const membership = await checkMembership(supabase, workspaceId, userId)
  if (!membership) return c.json({ error: 'Not a member of this workspace' }, 403)

  const { data: boards } = await supabase
    .from('boards').select('id').eq('workspace_id', workspaceId).eq('is_archived', false)
  const boardIds = (boards ?? []).map((b) => b.id)
  if (boardIds.length === 0) return c.json([])

  const since = new Date()
  since.setFullYear(since.getFullYear() - 1)

  const sinceISO = since.toISOString()

  // Members see only tasks they created or were assigned to
  if (!['owner', 'admin'].includes(membership.role)) {
    const { data: assignedTasks } = await supabase
      .from('task_assignees').select('task_id').eq('user_id', userId)
    const assignedIds = (assignedTasks ?? []).map((r) => r.task_id)

    const baseQuery = () => supabase
      .from('tasks')
      .select('completed_at')
      .eq('status', 'done')
      .in('board_id', boardIds)
      .gte('completed_at', sinceISO)

    const [{ data: createdTasks }, { data: assignedTaskData }] = await Promise.all([
      baseQuery().eq('created_by', userId),
      assignedIds.length > 0
        ? baseQuery().in('id', assignedIds)
        : Promise.resolve({ data: [] as Array<{ completed_at: string | null }> }),
    ])

    const allDates = [
      ...(createdTasks ?? []),
      ...(assignedTaskData ?? []),
    ].map((t) => t.completed_at!.slice(0, 10))

    const counts = allDates.reduce<Record<string, number>>((acc, d) => {
      acc[d] = (acc[d] ?? 0) + 1; return acc
    }, {})
    return c.json(Object.entries(counts).map(([date, count]) => ({ date, count })))
  }

  // Admins/owners see all workspace tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('completed_at')
    .eq('status', 'done')
    .in('board_id', boardIds)
    .gte('completed_at', sinceISO)

  const counts = (tasks ?? []).reduce<Record<string, number>>((acc, t) => {
    if (!t.completed_at) return acc
    const d = t.completed_at.slice(0, 10)
    acc[d] = (acc[d] ?? 0) + 1; return acc
  }, {})
  return c.json(Object.entries(counts).map(([date, count]) => ({ date, count })))
})

// ── GET /api/v1/tasks/upcoming?workspace_id=X ────────────────────────────────
// Active tasks with due_date for Calendar view

tasksRouter.get('/upcoming', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)

  const supabase = getSupabase(c.env)
  if (!await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { data: boards } = await supabase
    .from('boards').select('id').eq('workspace_id', workspaceId).eq('is_archived', false)

  const boardIds = (boards ?? []).map((b) => b.id)
  if (boardIds.length === 0) return c.json([])

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, task_assignees(user_id)')
    .in('board_id', boardIds)
    .not('status', 'eq', 'done')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  const result = (tasks ?? []).map((t) => ({
    ...t,
    assignee_ids: (t.task_assignees ?? []).map((a: { user_id: string }) => a.user_id),
    task_assignees: undefined,
  }))

  return c.json(result)
})

// ── GET /api/v1/tasks/completed?workspace_id=X ───────────────────────────────
// Returns done tasks for Calendar view (all workspace members can see)

tasksRouter.get('/completed', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)

  const supabase = getSupabase(c.env)
  if (!await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { data: boards } = await supabase
    .from('boards')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)

  const boardIds = (boards ?? []).map((b) => b.id)
  if (boardIds.length === 0) return c.json([])

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, task_assignees(user_id)')
    .eq('status', 'done')
    .in('board_id', boardIds)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(200)

  const result = (tasks ?? []).map((t) => ({
    ...t,
    assignee_ids: (t.task_assignees ?? []).map((a: { user_id: string }) => a.user_id),
    task_assignees: undefined,
  }))

  return c.json(result)
})

// ── GET /api/v1/tasks/pending-review?workspace_id=X ──────────────────────────
// Admin/owner only: list all in_review tasks in workspace

tasksRouter.get('/pending-review', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id required' }, 400)

  const supabase = getSupabase(c.env)
  const membership = await checkMembership(supabase, workspaceId, userId)
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Only admins can view pending reviews' }, 403)
  }

  const { data: boards } = await supabase
    .from('boards')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)

  const boardIds = (boards ?? []).map((b) => b.id)
  if (boardIds.length === 0) return c.json([])

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, task_assignees(user_id)')
    .eq('status', 'in_review')
    .in('board_id', boardIds)
    .order('submitted_at', { ascending: true })

  const result = (tasks ?? []).map((t) => ({
    ...t,
    assignee_ids: (t.task_assignees ?? []).map((a: { user_id: string }) => a.user_id),
    task_assignees: undefined,
  }))

  return c.json(result)
})
