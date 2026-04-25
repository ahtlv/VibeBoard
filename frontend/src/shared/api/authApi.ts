import { supabase } from './supabaseClient'
import { apiClient } from './client'
import type { User } from '@/entities/user/types'

export const authApi = {
  /** Supabase email+password sign-up — sends confirmation email */
  register: (email: string, password: string, name: string) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } }),

  /** Supabase email+password sign-in */
  login: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  /** Sign out — clears Supabase session */
  logout: () => supabase.auth.signOut(),

  /** GET /auth/me — load user profile from public.users via FastAPI */
  getMe: (): Promise<User> =>
    apiClient.get<User>('/auth/me'),
}
