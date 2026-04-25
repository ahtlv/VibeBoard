import { Hono } from 'hono'
import type { AppEnv, DbUser } from '../types'
import { authMiddleware } from '../middleware/auth'

export const authRouter = new Hono<AppEnv>()

authRouter.get('/me', authMiddleware, (c) => {
  const user: DbUser = c.get('user')
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    is_email_verified: true,
    plan: user.plan,
    settings: {
      theme: user.settings_theme,
      language: user.settings_language,
      email_notifications: user.settings_email_notifications,
      desktop_notifications: user.settings_desktop_notifications,
    },
    created_at: user.created_at,
  })
})
