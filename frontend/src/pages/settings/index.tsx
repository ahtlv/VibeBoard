import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/shared/ui/AppShell'
import { ProBadge } from '@/shared/ui/PremiumGate'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useAuth } from '@/features/auth/store'

// ── toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

// ── section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

const PREMIUM_THEMES = [
  { id: 'nord',    name: 'Nord',    icon: '🧊', hint: 'Arctic blue' },
  { id: 'sunset',  name: 'Sunset',  icon: '🌅', hint: 'Warm orange' },
  { id: 'forest',  name: 'Forest',  icon: '🌲', hint: 'Deep green'  },
]

export function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isPro = user?.plan === 'pro' || user?.plan === 'team'

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??'

  // TODO: подключить к settingsApi.update()
  const [emailNotifications, setEmailNotifications] = useState(
    user?.settings.emailNotifications ?? true,
  )
  const [desktopNotifications, setDesktopNotifications] = useState(
    user?.settings.desktopNotifications ?? false,
  )

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Profile */}
        <Section title="Profile">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                {initials}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                {user?.plan && (
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium capitalize text-indigo-600 dark:text-indigo-400">
                    {user.plan}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>

            {/* TODO: подключить модалку редактирования профиля */}
            <button
              disabled
              className="shrink-0 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Edit profile
            </button>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Choose your interface theme.</p>
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map((t) => {
              const isActive = theme === t
              return (
                <button
                  key={t}
                  onClick={() => { if (theme !== t) toggleTheme() }}
                  className={[
                    'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700',
                  ].join(' ')}
                >
                  <span className="text-xl">{t === 'light' ? '☀️' : '🌙'}</span>
                  <div>
                    <p className={`text-sm font-medium capitalize ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {t}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t === 'light' ? 'Default light' : 'Easy on eyes'}
                    </p>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-indigo-500 dark:text-indigo-400">✓</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Premium themes */}
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Premium themes
              </p>
              <ProBadge />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PREMIUM_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => !isPro && navigate('/billing')}
                  disabled={isPro}
                  aria-label={isPro ? `${t.name} theme (available)` : `${t.name} theme — upgrade to unlock`}
                  className={[
                    'relative flex flex-col items-start rounded-lg border p-3 text-left transition-colors',
                    isPro
                      ? 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 cursor-not-allowed opacity-60'
                      : 'border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer',
                  ].join(' ')}
                >
                  <span className="text-xl" aria-hidden>{t.icon}</span>
                  <p className="mt-1.5 text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{t.hint}</p>
                  {!isPro && (
                    <span className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 text-xs" aria-hidden>
                      🔒
                    </span>
                  )}
                </button>
              ))}
            </div>
            {!isPro && (
              <button
                onClick={() => navigate('/billing')}
                className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                Upgrade to Pro to unlock themes
              </button>
            )}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <Toggle
              label="Email notifications"
              description="Receive updates and reminders by email"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <Toggle
              label="Desktop notifications"
              description="Show browser notifications for task reminders"
              checked={desktopNotifications}
              onChange={setDesktopNotifications}
            />
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
