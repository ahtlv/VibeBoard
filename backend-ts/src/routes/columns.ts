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
})

columnsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = createColumnSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { board_id, title } = parsed.data

  // Проверяем что юзер — участник воркспейса доски
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

  // Вычисляем следующую позицию
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
    .insert({ board_id, title, position })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to create column' }, 500)

  return c.json(data, 201)
})
