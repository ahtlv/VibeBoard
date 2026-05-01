import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'
import { achievementsService } from '../services/achievementsService'

export const achievementsRouter = new Hono<AppEnv>()

achievementsRouter.use('*', authMiddleware)

// GET /api/v1/achievements
achievementsRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)
  const list = await achievementsService.list(supabase, userId)
  return c.json(list)
})
