import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import i18n from '@/shared/i18n'

export type Language = 'ru' | 'en'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function resolveLanguage(lang: string): Language {
  return lang === 'en' ? 'en' : 'ru'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    resolveLanguage(i18n.language),
  )

  useEffect(() => {
    const handler = (lang: string) => setLanguageState(resolveLanguage(lang))
    i18n.on('languageChanged', handler)
    return () => i18n.off('languageChanged', handler)
  }, [])

  function setLanguage(lang: Language) {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
