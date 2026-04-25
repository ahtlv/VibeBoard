import { Hono } from 'hono'
import type { AppEnv } from '../types'

export const healthRouter = new Hono<AppEnv>()

healthRouter.get('/', (c) => c.json({ status: 'ok' }))
