import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { getBoardWorkspace, checkMembership } from '../lib/access'

export const checklistItemsRouter = new Hono<AppEnv>()

checklistItemsRouter.use('*', authMiddleware)

async function getTaskBoardId(supabase: ReturnType<typeof getSupabase>, taskId: string) {
  const { data } = await supabase.from('tasks').select('board_id').eq('id', taskId).single()
  return data?.board_id ?? null
}

// POST /api/v1/tasks/:task_id/checklist-items
const createItemSchema = z.object({
  text: z.string().min(1).max(255),
})

checklistItemsRouter.post('/tasks/:task_id/checklist-items', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('task_id')
  const supabase = getSupabase(c.env)

  const boardId = await getTaskBoardId(supabase, taskId)
  if (!boardId) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = createItemSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  // Позиция = конец списка
  const { data: lastItem } = await supabase
    .from('checklist_items')
    .select('position')
    .eq('task_id', taskId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = lastItem ? lastItem.position + 1 : 0

  const { data, error } = await supabase
    .from('checklist_items')
    .insert({ task_id: taskId, text: parsed.data.text, is_completed: false, position })
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to create checklist item' }, 500)

  return c.json(data, 201)
})

// PATCH /api/v1/checklist-items/:id
const updateItemSchema = z.object({
  text: z.string().min(1).max(255).optional(),
  is_completed: z.boolean().optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' })

checklistItemsRouter.patch('/checklist-items/:id', async (c) => {
  const userId = c.get('userId')
  const itemId = c.req.param('id')
  const supabase = getSupabase(c.env)

  const { data: item } = await supabase.from('checklist_items').select('task_id').eq('id', itemId).single()
  if (!item) return c.json({ error: 'Checklist item not found' }, 404)

  const boardId = await getTaskBoardId(supabase, item.task_id)
  if (!boardId) return c.json({ error: 'Task not found' }, 404)

  const workspaceId = await getBoardWorkspace(supabase, boardId)
  if (!workspaceId || !await checkMembership(supabase, workspaceId, userId)) {
    return c.json({ error: 'Not a member of this workspace' }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = updateItemSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { data, error } = await supabase
    .from('checklist_items')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single()

  if (error || !data) return c.json({ error: error?.message ?? 'Failed to update checklist item' }, 500)

  return c.json(data)
})
