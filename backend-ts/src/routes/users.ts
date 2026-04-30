import { Hono } from 'hono'
import { z } from 'zod'
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

const updateSettingsSchema = z.object({
  language: z.enum(['ru', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  email_notifications: z.boolean().optional(),
  desktop_notifications: z.boolean().optional(),
})

// PATCH /api/v1/users/me/settings — update user settings
usersRouter.patch('/me/settings', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body: unknown = await c.req.json().catch(() => ({}))
  const parsed = updateSettingsSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const updates: Record<string, unknown> = {}
  if (parsed.data.language !== undefined) updates.settings_language = parsed.data.language
  if (parsed.data.theme !== undefined) updates.settings_theme = parsed.data.theme
  if (parsed.data.email_notifications !== undefined) updates.settings_email_notifications = parsed.data.email_notifications
  if (parsed.data.desktop_notifications !== undefined) updates.settings_desktop_notifications = parsed.data.desktop_notifications

  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400)

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, email, name, avatar_url, plan, settings_theme, settings_language, settings_email_notifications, settings_desktop_notifications, created_at')
    .single()

  if (error) return c.json({ error: error.message }, 500)

  return c.json({
    id: data.id,
    email: data.email,
    name: data.name,
    avatar_url: data.avatar_url,
    is_email_verified: true,
    plan: data.plan,
    settings: {
      theme: data.settings_theme,
      language: data.settings_language,
      email_notifications: data.settings_email_notifications,
      desktop_notifications: data.settings_desktop_notifications,
    },
    created_at: data.created_at,
  })
})
