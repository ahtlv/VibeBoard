import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/shared/api/authApi'
import { useAuth } from '@/features/auth/store'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

interface FormValues {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!values.password) {
    errors.password = 'Password is required'
  }
  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const { status } = useAuth()
  const [values, setValues] = useState<FormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/dashboard', { replace: true })
    }
  }, [status, navigate])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      const { error } = await authApi.login(values.email, values.password)
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email before signing in.')
        } else {
          toast.error(error.message)
        }
        return
      }
      // navigation happens in useEffect once status becomes 'authenticated'
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="fixed right-4 top-2.5 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            VibeBoard
          </span>
          <h1 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome back
          </h1>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange('email')}
                disabled={isLoading}
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                className={[
                  'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50',
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                ].join(' ')}
                placeholder="you@example.com"
              />
              {errors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange('password')}
                disabled={isLoading}
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                className={[
                  'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50',
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                ].join(' ')}
                placeholder="••••••••"
              />
              {errors.password && <p id="password-error" className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>

          <button
            type="button"
            onClick={() => authApi.loginWithGoogle()}
            className="mt-4 w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
