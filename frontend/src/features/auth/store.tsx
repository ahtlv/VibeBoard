import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { supabase } from '@/shared/api/supabaseClient'
import { setTokenAccessor } from '@/shared/api/client'
import { authApi } from '@/shared/api/authApi'
import type { User } from '@/entities/user/types'
import i18n from '@/shared/i18n'

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  status: AuthStatus
}

type AuthAction =
  | { type: 'SET_USER'; user: User }
  | { type: 'LOGOUT' }

interface AuthContextValue extends AuthState {
  logout: () => void
}

const initialState: AuthState = { user: null, status: 'idle' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.user, status: 'authenticated' }
    case 'LOGOUT':
      return { user: null, status: 'unauthenticated' }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Module-level token cache — updated synchronously on every auth state change
let _supabaseToken: string | null = null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Register a sync token accessor so apiClient always sends the latest token
    setTokenAccessor(() => _supabaseToken)

    // Subscribe to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      _supabaseToken = session?.access_token ?? null

      if (!session) {
        dispatch({ type: 'LOGOUT' })
        return
      }

      // Load our public.users profile from the FastAPI backend
      authApi.getMe()
        .then((user) => {
          if (user.settings.language) i18n.changeLanguage(user.settings.language)
          dispatch({ type: 'SET_USER', user })
        })
        .catch(() => dispatch({ type: 'LOGOUT' }))
    })

    // Check for an existing session on mount (triggers onAuthStateChange with INITIAL_SESSION)
    supabase.auth.getSession()

    return () => subscription.unsubscribe()
  }, [])

  function logout() {
    supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ ...state, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
