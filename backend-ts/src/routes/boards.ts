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
