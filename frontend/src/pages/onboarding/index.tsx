import { useState, type FormEvent } from 'react'

export function OnboardingPage() {
  const [workspaceName, setWorkspaceName] = useState('')
  const [error, setError] = useState<string | undefined>()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!workspaceName.trim()) {
      setError('Workspace name is required')
      return
    }
    if (workspaceName.trim().length < 2) {
      setError('Workspace name must be at least 2 characters')
      return
    }

    setError(undefined)
    // TODO: подключить workspacesApi.create({ name: workspaceName.trim() })
    console.log('create workspace', workspaceName.trim())
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
            Welcome! Let&apos;s get started
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first workspace to organize your boards and tasks.
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
                Workspace name
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => {
                  setWorkspaceName(e.target.value)
                  if (error) setError(undefined)
                }}
                aria-describedby={error ? 'workspace-error' : 'workspace-hint'}
                aria-invalid={!!error}
                className={[
                  'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                ].join(' ')}
                placeholder="My Team, Personal, Startup..."
                autoFocus
              />
              {error ? (
                <p id="workspace-error" className="mt-1 text-xs text-red-500">
                  {error}
                </p>
              ) : (
                <p id="workspace-hint" className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  You can rename or add more workspaces later.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
