import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Popover } from '@/shared/ui/Popover'
import { TomatoIcon } from './TomatoIcon'
import { PomodoroPanel } from './PomodoroPanel'
import { usePomodoro } from '../model/PomodoroProvider'
import { formatSeconds } from '../lib/format'

const HIDDEN_PATHS = ['/login', '/register', '/onboarding']

const glassBase = [
  'bg-white/70 dark:bg-gray-900/70',
  'backdrop-blur-xl',
  'border border-white/30 dark:border-white/10',
  'shadow-2xl shadow-red-500/10',
].join(' ')

export function PomodoroFab() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { state } = usePomodoro()
  const close = useCallback(() => setOpen(false), [])

  if (HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) return null

  const isRunning = state.status === 'running'
  const isPaused = state.status === 'paused'
  const isActive = isRunning || isPaused

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Popover
        open={open}
        onClose={close}
        align="top-right"
        anchor={
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Pomodoro timer"
            aria-expanded={open}
            className={[
              'flex items-center gap-3 transition-all duration-300',
              isActive ? [
                'rounded-full pl-4 pr-5 py-3',
                glassBase,
                isRunning ? 'ring-2 ring-red-400/40' : '',
              ].filter(Boolean).join(' ') : 'rounded-full p-1',
            ].filter(Boolean).join(' ')}
            style={isRunning ? {
              boxShadow: '0 0 0 0 rgba(239,68,68,0.4), 0 8px 32px rgba(239,68,68,0.15)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            } : undefined}
          >
            <span
              style={!isActive ? {
                display: 'inline-flex',
                animation: 'tomato-idle 20s ease-in-out infinite',
                transformOrigin: 'center bottom',
              } : undefined}
            >
              <TomatoIcon size={isActive ? 36 : 44} />
            </span>
            {isActive && (
              <span className={[
                'text-lg font-mono font-bold tabular-nums tracking-tight',
                isPaused ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100',
              ].join(' ')}>
                {formatSeconds(state.remainingSeconds)}
              </span>
            )}
            {isRunning && (
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden="true" />
            )}
          </button>
        }
      >
        <PomodoroPanel onClose={close} />
      </Popover>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.12); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0), 0 8px 40px rgba(239,68,68,0.25); }
        }
      `}</style>
    </div>
  )
}
