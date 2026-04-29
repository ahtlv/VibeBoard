import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

export const columnsRouter = new Hono<AppEnv>()

columnsRouter.use('*', authMiddleware)

// POST /api/v1/columns
const createColumnSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
})

columnsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = createColumnSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { board_id, title, color } = parsed.data

  const { data: board } = await supabase
    .from('boards')
    .select('workspace_id')
    .eq('id', board_id)
    .single()

  if (!board) return c.json({ error: 'Board not found' }, 404)

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', board.workspace_id)
    .eq('user_id', userId)
    .single()

  if (!membership) return c.json({ error: 'Not a member of this workspace' }, 403)
  if (!['owner', 'admin'].includes(membership.role)) return c.json({ error: 'Only admins can create columns' }, 403)

  const { data: lastCol } = await supabase
    .from('columns')
    .select('position')
    .eq('board_id', board_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = lastCol ? lastCol.position + 1 : 0

  const { data, error } = await supabase
    .from('columns')
    .insert({ board_id, title, position, color: color ?? null })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to create column' }, 500)

  return c.json(data, 201)
})

// PATCH /api/v1/columns/:id
const updateColumnSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
}).refine((d) => d.title !== undefined || d.color !== undefined, {
  message: 'At least one field required',
})

columnsRouter.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const columnId = c.req.param('id')

  const body = await c.req.json().catch(() => null)
  const parsed = updateColumnSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  // Проверяем доступ через колонку → доску → workspace
  const { data: col } = await supabase
    .from('columns')
    .select('board_id, boards(workspace_id)')
    .eq('id', columnId)
    .single()

  if (!col) return c.json({ error: 'Column not found' }, 404)

  const boardData = Array.isArray(col.boards) ? col.boards[0] : col.boards
  const workspaceId = (boardData as { workspace_id: string } | null)?.workspace_id
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()

  if (!membership) return c.json({ error: 'Not a member of this workspace' }, 403)
  if (!['owner', 'admin'].includes(membership.role)) return c.json({ error: 'Only admins can update columns' }, 403)

  const patch: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) patch.title = parsed.data.title
  if ('color' in parsed.data) patch.color = parsed.data.color ?? null

  const { data, error } = await supabase
    .from('columns')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', columnId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to update column' }, 500)

  return c.json(data)
})

// DELETE /api/v1/columns/:id
columnsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const columnId = c.req.param('id')

  const { data: col } = await supabase
    .from('columns')
    .select('board_id, boards(workspace_id)')
    .eq('id', columnId)
    .single()

  if (!col) return c.json({ error: 'Column not found' }, 404)

  const boardData = Array.isArray(col.boards) ? col.boards[0] : col.boards
  const workspaceId = (boardData as { workspace_id: string } | null)?.workspace_id
  if (!workspaceId) return c.json({ error: 'Board not found' }, 404)

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()

  if (!membership) return c.json({ error: 'Not a member of this workspace' }, 403)
  if (!['owner', 'admin'].includes(membership.role)) return c.json({ error: 'Only admins can delete columns' }, 403)

  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', columnId)

  if (error) return c.json({ error: error.message }, 500)

  return c.body(null, 204)
})
