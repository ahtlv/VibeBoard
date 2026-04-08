import { createContext, useContext, useReducer, type ReactNode } from 'react'
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

  function setAuth(user: User, accessToken: string) {
    dispatch({ type: 'SET_AUTH', user, accessToken })
  }

  function logout() {
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
