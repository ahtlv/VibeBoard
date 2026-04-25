export type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  FRONTEND_URL: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
}

export type Variables = {
  userId: string
  user: DbUser
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}

export type DbUser = {
  id: string
  email: string
  name: string
  avatar_url: string | null
  plan: string
  settings_theme: string
  settings_language: string
  settings_email_notifications: boolean
  settings_desktop_notifications: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}
