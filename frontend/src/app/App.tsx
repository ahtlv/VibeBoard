import '@/shared/i18n'
import { Toaster } from 'sonner'
import { AppRouter } from './router'
import { ThemeProvider } from './providers/ThemeProvider'
import { LanguageProvider } from './providers/LanguageProvider'
import { AuthProvider } from '@/features/auth/store'

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
