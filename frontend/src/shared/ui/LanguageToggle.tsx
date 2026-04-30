import { useLanguage } from '../../app/providers/LanguageProvider'
import { usersApi } from '../api/usersApi'
import { useAuth } from '@/features/auth/store'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const { user } = useAuth()

  async function handleToggle() {
    const next = language === 'ru' ? 'en' : 'ru'
    setLanguage(next)
    if (user) {
      usersApi.updateSettings({ language: next }).catch(() => {})
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      {language === 'ru' ? 'RU' : 'EN'}
    </button>
  )
}
