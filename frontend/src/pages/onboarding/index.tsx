import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { workspacesApi } from '@/shared/api/workspacesApi'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [workspaceName, setWorkspaceName] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!workspaceName.trim()) {
      setError(t('onboarding.nameRequired'))
      return
    }
    if (workspaceName.trim().length < 2) {
      setError(t('onboarding.nameTooShort'))
      return
    }

    setError(undefined)
    setIsLoading(true)
    try {
      await workspacesApi.createWorkspace({ name: workspaceName.trim() })
      navigate('/dashboard', { replace: true })
    } catch {
      setError(t('onboarding.failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            VibeBoard
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('onboarding.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label
                htmlFor="workspaceName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('onboarding.workspaceName')}
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => {
                  setWorkspaceName(e.target.value)
                  if (error) setError(undefined)
                }}
                disabled={isLoading}
                placeholder={t('onboarding.workspacePlaceholder')}
                className={[
                  'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50',
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                ].join(' ')}
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? t('onboarding.creating') : t('onboarding.create')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
