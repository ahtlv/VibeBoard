import { Toaster } from 'sonner'
import { AppRouter } from './router'
import { ThemeProvider } from './providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/store'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}
