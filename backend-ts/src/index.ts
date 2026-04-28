import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types'
import { healthRouter } from './routes/health'
import { authRouter } from './routes/auth'
import { workspacesRouter } from './routes/workspaces'
import { boardsRouter } from './routes/boards'
import { columnsRouter } from './routes/columns'
import { tasksRouter } from './routes/tasks'
import { checklistItemsRouter } from './routes/checklistItems'
import { timeEntriesRouter } from './routes/timeEntries'
import { analyticsRouter } from './routes/analytics'
import { billingRouter } from './routes/billing'
import { usersRouter } from './routes/users'

const app = new Hono<AppEnv>()

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://vibeboard.6150159.workers.dev'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.route('/api/v1/health', healthRouter)
app.route('/api/v1/auth', authRouter)
app.route('/api/v1/workspaces', workspacesRouter)
app.route('/api/v1/boards', boardsRouter)
app.route('/api/v1/columns', columnsRouter)
app.route('/api/v1/tasks', tasksRouter)
app.route('/api/v1', checklistItemsRouter)
app.route('/api/v1/time-entries', timeEntriesRouter)
app.route('/api/v1/analytics', analyticsRouter)
app.route('/api/v1/billing', billingRouter)
app.route('/api/v1/users', usersRouter)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
