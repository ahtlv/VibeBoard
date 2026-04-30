import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/shared/api/authApi'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { LanguageToggle } from '@/shared/ui/LanguageToggle'

interface FormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass = (hasError: boolean, disabled: boolean) =>
  [
    'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    disabled ? 'opacity-50' : '',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
  ].join(' ')

export function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function validate(vals: FormValues): FormErrors {
    const errs: FormErrors = {}
    if (!vals.name.trim()) {
      errs.name = t('auth.nameRequired')
    } else if (vals.name.trim().length < 2) {
      errs.name = t('auth.nameTooShort')
    }
    if (!vals.email.trim()) {
      errs.email = t('auth.emailRequired')
    } else if (!EMAIL_REGEX.test(vals.email)) {
      errs.email = t('auth.invalidEmail')
    }
    if (!vals.password) {
      errs.password = t('auth.passwordRequired')
    } else if (vals.password.length < 8) {
      errs.password = t('auth.passwordTooShort')
    }
    if (!vals.confirmPassword) {
      errs.confirmPassword = t('auth.confirmPasswordRequired')
    } else if (vals.password && vals.confirmPassword !== vals.password) {
      errs.confirmPassword = t('auth.passwordsNoMatch')
    }
    return errs
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setApiError(null)
    setIsLoading(true)

    try {
      const { data, error } = await authApi.register(values.email, values.password, values.name.trim())
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setApiError(t('auth.emailExists'))
        } else {
          setApiError(error.message)
        }
        return
      }
      if (data.session) {
        navigate('/onboarding', { replace: true })
      } else {
        setRegisteredEmail(values.email)
      }
    } catch {
      setApiError(t('auth.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
      if (apiError) setApiError(null)
    }
  }

  const fieldLabels: Record<keyof FormValues, string> = {
    name: t('auth.name'),
    email: t('auth.email'),
    password: t('auth.password'),
    confirmPassword: t('auth.confirmPassword'),
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="fixed right-4 top-2.5 z-10 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            VibeBoard
          </span>
          <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('auth.createYourAccount')}
          </h1>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          {apiError && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}

          {registeredEmail ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                ✓
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('auth.checkEmail')}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {t('auth.confirmationSent', { email: registeredEmail })}
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('auth.backToSignIn')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {(['name', 'email', 'password', 'confirmPassword'] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {fieldLabels[field]}
                  </label>
                  <input
                    id={field}
                    type={field === 'email' ? 'email' : field.includes('assword') ? 'password' : 'text'}
                    autoComplete={field === 'email' ? 'email' : field === 'name' ? 'name' : 'new-password'}
                    value={values[field]}
                    onChange={handleChange(field)}
                    disabled={isLoading}
                    aria-invalid={!!errors[field]}
                    className={inputClass(!!errors[field], isLoading)}
                    placeholder={field === 'email' ? t('auth.emailPlaceholder') : field.includes('assword') ? '••••••••' : t('auth.namePlaceholder')}
                  />
                  {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">{t('common.or')}</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>
          <button
            type="button"
            onClick={() => authApi.loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.continueWithGoogle')}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
