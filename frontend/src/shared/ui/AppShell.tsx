import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface AppShellProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/workspace', label: 'Members' },
  { to: '/settings', label: 'Settings' },
  { to: '/billing', label: 'Billing' },
] as const

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex h-full items-center gap-3 px-4">
          {/* Mobile menu toggle */}
          <button
            aria-label="Toggle navigation"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors lg:hidden"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>

          {/* Logo */}
          <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 flex-1">
            VibeBoard
          </span>

          <ThemeToggle />
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar backdrop (mobile) */}
        {sidebarOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={[
            'fixed top-14 bottom-0 z-20 w-56 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
            'flex flex-col overflow-y-auto transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:translate-x-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]',
          ].join(' ')}
        >
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1" role="list">
              {NAV_ITEMS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                      ].join(' ')
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
