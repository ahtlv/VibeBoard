import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

export const boardsRouter = new Hono<AppEnv>()

boardsRouter.use('*', authMiddleware)

async function isMember(supabase: ReturnType<typeof getSupabase>, workspaceId: string, userId: string) {
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()
  return data ?? null
}

// GET /api/v1/boards?workspace_id=...
boardsRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.query('workspace_id')
  if (!workspaceId) return c.json({ error: 'workspace_id is required' }, 422)

  const supabase = getSupabase(c.env)

  if (!await isMember(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { data, error } = await supabase
    .from('boards')
    .select('id, workspace_id, created_by, title, description, is_archived, created_at, updated_at')
    .eq('workspace_id', workspaceId)
    .eq('is_archived', false)
    .order('created_at')
    .limit(50)

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data ?? [])
})

// POST /api/v1/boards
const createBoardSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
})

boardsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = createBoardSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { workspace_id, title, description } = parsed.data

  if (!await isMember(supabase, workspace_id, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { data, error } = await supabase
    .from('boards')
    .insert({ workspace_id, title, description, created_by: userId, is_archived: false })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to create board' }, 500)

  return c.json(data, 201)
})

// GET /api/v1/boards/:id — полная доска с колонками и задачами
boardsRouter.get('/:id', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('is_archived', false)
    .single()

  if (!board) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, board.workspace_id, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const [{ data: columns }, { data: tasks }, { data: assignees }] = await Promise.all([
    supabase.from('columns').select('*').eq('board_id', boardId).order('position'),
    supabase.from('tasks').select('*').eq('board_id', boardId).eq('is_archived', false).order('position'),
    supabase.from('task_assignees').select('task_id, user_id').eq('board_id', boardId),
  ])

  const assigneeMap = (assignees ?? []).reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.task_id]) acc[row.task_id] = []
    acc[row.task_id].push(row.user_id)
    return acc
  }, {})

  const tasksWithAssignees = (tasks ?? []).map((t) => ({
    ...t,
    assignee_ids: assigneeMap[t.id] ?? [],
  }))

  const columnsWithTasks = (columns ?? []).map((col) => ({
    ...col,
    tasks: tasksWithAssignees.filter((t) => t.column_id === col.id),
  }))

  return c.json({ ...board, columns: columnsWithTasks })
})

// PATCH /api/v1/boards/:id
const updateBoardSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
})

boardsRouter.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = updateBoardSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { data: board } = await supabase
    .from('boards')
    .select('workspace_id')
    .eq('id', boardId)
    .single()

  if (!board) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, board.workspace_id, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { data, error } = await supabase
    .from('boards')
    .update(parsed.data)
    .eq('id', boardId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to update board' }, 500)

  return c.json(data)
})

// ── Board Members ─────────────────────────────────────────────────────────────

async function getBoardWorkspace(supabase: ReturnType<typeof getSupabase>, boardId: string) {
  const { data } = await supabase
    .from('boards')
    .select('workspace_id')
    .eq('id', boardId)
    .eq('is_archived', false)
    .single()
  return data?.workspace_id ?? null
}

// GET /api/v1/boards/:id/members
boardsRouter.get('/:id/members', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, workspaceId, userId)) return c.json({ error: 'Forbidden' }, 403)

  const { data, error } = await supabase
    .from('board_members')
    .select('id, board_id, user_id, email, role, status, invited_by, joined_at, users!board_members_user_id_fkey(name, avatar_url)')
    .eq('board_id', boardId)
    .order('joined_at')

  if (error) return c.json({ error: error.message }, 500)

  return c.json(
    (data ?? []).map((m) => ({
      id: m.id,
      boardId: m.board_id,
      userId: m.user_id,
      email: m.email,
      name: (m.users as unknown as { name: string; avatar_url: string | null } | null)?.name ?? m.email.split('@')[0],
      avatarUrl: (m.users as unknown as { name: string; avatar_url: string | null } | null)?.avatar_url ?? null,
      role: m.role,
      status: m.status,
      joinedAt: m.joined_at,
    })),
  )
})

// POST /api/v1/boards/:id/members
const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
})

boardsRouter.post('/:id/members', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, workspaceId, userId)) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json().catch(() => null)
  const parsed = addMemberSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { email, role } = parsed.data

  // Ищем пользователя по email
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('email', email)
    .single()

  const { data, error } = await supabase
    .from('board_members')
    .insert({
      board_id: boardId,
      user_id: existingUser?.id ?? null,
      email,
      role,
      status: existingUser ? 'active' : 'pending',
      invited_by: userId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return c.json({ error: 'Already a member' }, 409)
    return c.json({ error: error.message }, 500)
  }

  // Если пользователь существует — добавляем в workspace_members (если ещё не там)
  if (existingUser) {
    await supabase
      .from('workspace_members')
      .upsert(
        { workspace_id: workspaceId, user_id: existingUser.id, role: 'member' },
        { onConflict: 'workspace_id,user_id', ignoreDuplicates: true },
      )
  }

  return c.json({
    id: data.id,
    boardId: data.board_id,
    userId: data.user_id,
    email: data.email,
    name: existingUser?.name ?? email.split('@')[0],
    avatarUrl: existingUser?.avatar_url ?? null,
    role: data.role,
    status: data.status,
    joinedAt: data.joined_at,
  }, 201)
})

// PATCH /api/v1/boards/:id/members/:memberId
const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member']),
})

boardsRouter.patch('/:id/members/:memberId', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const memberId = c.req.param('memberId')
  const supabase = getSupabase(c.env)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, workspaceId, userId)) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json().catch(() => null)
  const parsed = updateMemberSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { data, error } = await supabase
    .from('board_members')
    .update({ role: parsed.data.role })
    .eq('id', memberId)
    .eq('board_id', boardId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Not found' }, 404)

  return c.json({ id: data.id, role: data.role })
})

// DELETE /api/v1/boards/:id/members/:memberId
boardsRouter.delete('/:id/members/:memberId', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const memberId = c.req.param('memberId')
  const supabase = getSupabase(c.env)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, workspaceId, userId)) return c.json({ error: 'Forbidden' }, 403)

  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('id', memberId)
    .eq('board_id', boardId)

  if (error) return c.json({ error: error.message }, 500)

  return new Response(null, { status: 204 })
})

// POST /api/v1/boards/:id/columns/reorder
const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string().uuid()).min(1),
})

boardsRouter.post('/:id/columns/reorder', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = reorderColumnsSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)

  const membership = await isMember(supabase, workspaceId, userId)
  if (!membership) return c.json({ error: 'Not a member of this workspace' }, 403)
  if (!['owner', 'admin'].includes(membership.role)) return c.json({ error: 'Only admins can reorder columns' }, 403)

  const timestamp = new Date().toISOString()
  const results = await Promise.all(
    parsed.data.columnIds.map((id, position) =>
      supabase.from('columns').update({ position, updated_at: timestamp }).eq('id', id)
    )
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) return c.json({ error: failed.error.message }, 500)

  return c.body(null, 204)
})

// ── DELETE board (soft archive) ───────────────────────────────────────────────

// DELETE /api/v1/boards/:id — soft archive
boardsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const boardId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: board } = await supabase
    .from('boards')
    .select('workspace_id')
    .eq('id', boardId)
    .single()

  if (!board) return c.json({ error: 'Board not found' }, 404)
  if (!await isMember(supabase, board.workspace_id, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const { error } = await supabase
    .from('boards')
    .update({ is_archived: true })
    .eq('id', boardId)

  if (error) return c.json({ error: error.message }, 500)

  return new Response(null, { status: 204 })
})
