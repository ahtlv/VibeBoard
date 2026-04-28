import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

export const usersRouter = new Hono<AppEnv>()

usersRouter.use('*', authMiddleware)

// GET /api/v1/users/search?q=email — поиск пользователей по email (для autocomplete)
usersRouter.get('/search', async (c) => {
  const q = c.req.query('q')?.trim() ?? ''
  if (q.length < 2) return c.json([])

  const supabase = getSupabase(c.env)

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url')
    .ilike('email', `%${q}%`)
    .eq('is_active', true)
    .limit(8)

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data ?? [])
})
