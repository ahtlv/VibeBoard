import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { setTokenAccessor } from '@/shared/api/client'
import type { User } from '@/entities/user/types'

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  accessToken: string | null
  status: AuthStatus
}

type AuthAction =
  | { type: 'SET_AUTH'; user: User; accessToken: string }
  | { type: 'LOGOUT' }

interface AuthContextValue extends AuthState {
  setAuth: (user: User, accessToken: string) => void
  logout: () => void
}

const TOKEN_KEY = 'vb_access_token'

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH':
      return { user: action.user, accessToken: action.accessToken, status: 'authenticated' }
    case 'LOGOUT':
      return { user: null, accessToken: null, status: 'unauthenticated' }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Регистрируем accessor токена в apiClient (без циклических зависимостей)
  useEffect(() => {
    setTokenAccessor(() => localStorage.getItem(TOKEN_KEY))
  }, [])

  // При маунте — если нет токена в localStorage, сразу переходим в unauthenticated.
  // Если токен есть — переходим в unauthenticated тоже: user не загружен,
  // /auth/me будет добавлен в refresh token flow. После login setAuth
  // восстановит состояние с актуальным user объектом.
  useEffect(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  function setAuth(user: User, accessToken: string) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    dispatch({ type: 'SET_AUTH', user, accessToken })
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
