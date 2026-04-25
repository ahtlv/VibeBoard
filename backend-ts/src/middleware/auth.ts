import { createMiddleware } from 'hono/factory'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { AppEnv } from '../types'
import { getSupabase } from '../lib/supabase'

const JWKS_URL = 'https://axjzakmelmoqmzuxvwsa.supabase.co/auth/v1/.well-known/jwks.json'

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL))
    const { payload } = await jwtVerify(token, JWKS, { audience: 'authenticated' })

    const userId = payload.sub
    if (!userId) return c.json({ error: 'Not authenticated' }, 401)

    const supabase = getSupabase(c.env)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error || !user) return c.json({ error: 'Not authenticated' }, 401)

    c.set('userId', userId)
    c.set('user', user)
  } catch {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  await next()
})
