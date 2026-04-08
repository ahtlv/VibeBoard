import { AppRouter } from './router'
import { ThemeProvider } from './providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/store'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}
