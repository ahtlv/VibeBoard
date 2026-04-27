import { supabase } from './supabaseClient'
import { apiClient } from './client'
import type { User } from '@/entities/user/types'

export const authApi = {
  /** Supabase email+password sign-up — sends confirmation email */
  register: (email: string, password: string, name: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    }),

  /** Supabase email+password sign-in */
  login: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  /** Google OAuth sign-in */
  loginWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    }),

  /** Sign out — clears Supabase session */
  logout: () => supabase.auth.signOut(),

  /** GET /auth/me — load user profile from public.users via FastAPI */
  getMe: (): Promise<User> =>
    apiClient.get<User>('/auth/me'),
}
