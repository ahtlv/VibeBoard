import { serve } from '@hono/node-server'
import app from './index'

const port = parseInt(process.env.PORT ?? '8787')

serve({
  fetch: (req) =>
    app.fetch(req, {
      SUPABASE_URL: process.env.SUPABASE_URL ?? '',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ?? '',
      FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    }),
  port,
})

console.log(`VibeBoard API (TypeScript) running on http://0.0.0.0:${port}`)
