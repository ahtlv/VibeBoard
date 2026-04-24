import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/store'
import { authApi } from '@/shared/api/authApi'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

type VerifyState = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [state, setState] = useState<VerifyState>('loading')

  useEffect(() => {
    let cancelled = false
    const token = params.get('token')

    async function verify() {
      if (!token) {
        setState('error')
        return
      }

      try {
        const result = await authApi.verifyEmail(token)
        if (cancelled) return
        setAuth(result.user, result.access_token)
        setState('success')
        setTimeout(() => navigate('/onboarding', { replace: true }), 1200)
      } catch {
        if (!cancelled) setState('error')
      }
    }

    verify()
    return () => { cancelled = true }
  }, [navigate, params])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="fixed right-4 top-2.5 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            VibeBoard
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {state === 'loading' && (
            <>
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirming your email
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will only take a moment.
              </p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                ✓
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Email confirmed
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Taking you into VibeBoard now.
              </p>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                !
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Link expired or invalid
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please create a new account or contact support for a fresh confirmation link.
              </p>
              <Link
                to="/register"
                className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Back to registration
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
