import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/shared/api/authApi'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

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

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) {
    errors.name = 'Name is required'
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (values.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match'
  }
  return errors
}

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
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
          setApiError('An account with this email already exists')
        } else {
          setApiError(error.message)
        }
        return
      }
      if (data.session) {
        // Email confirmation disabled in Supabase — user is logged in immediately
        navigate('/onboarding', { replace: true })
      } else {
        setRegisteredEmail(values.email)
      }
    } catch {
      setApiError('Something went wrong. Please try again.')
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
            Create your account
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
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Check your email</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  We sent a confirmation link to{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">{registeredEmail}</span>.
                  Open it to activate your account.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {(['name', 'email', 'password', 'confirmPassword'] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field === 'confirmPassword' ? 'Confirm password' : field.charAt(0).toUpperCase() + field.slice(1)}
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
                    placeholder={field === 'email' ? 'you@example.com' : field.includes('assword') ? '••••••••' : 'Your name'}
                  />
                  {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
