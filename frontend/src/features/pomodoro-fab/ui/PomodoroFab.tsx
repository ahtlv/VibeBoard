import { useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Popover } from '@/shared/ui/Popover'
import { TomatoIcon } from './TomatoIcon'
import { PomodoroPanel } from './PomodoroPanel'
import { usePomodoro } from '../model/PomodoroProvider'
import { formatSeconds } from '../lib/format'

const HIDDEN_PATHS = ['/login', '/register', '/onboarding']
const DATA_WAIT_MS = 400

const glassBase = [
  'bg-white/70 dark:bg-gray-900/70',
  'backdrop-blur-xl',
  'border border-white/30 dark:border-white/10',
  'shadow-2xl shadow-red-500/10',
].join(' ')

const glassBreak = [
  'bg-white/70 dark:bg-gray-900/70',
  'backdrop-blur-xl',
  'border border-white/30 dark:border-white/10',
  'shadow-2xl shadow-emerald-500/10',
].join(' ')

export function PomodoroFab() {
  const [open, setOpen] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(false)
  const location = useLocation()
  const { state, achievements, todayStats } = usePomodoro()
  const close = useCallback(() => {
    setOpen(false)
    setPendingOpen(false)
  }, [])

  const dataReady = achievements !== null && todayStats !== null

  useEffect(() => {
    if (!pendingOpen) return
    if (dataReady) {
      setOpen(true)
      setPendingOpen(false)
      return
    }
    const timer = setTimeout(() => {
      setOpen(true)
      setPendingOpen(false)
    }, DATA_WAIT_MS)
    return () => clearTimeout(timer)
  }, [pendingOpen, dataReady])

  if (HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) return null

  const isRunning = state.status === 'running'
  const isPaused  = state.status === 'paused'
  const isActive  = isRunning || isPaused
  const isBreak   = state.phase === 'break'

  function handleFabClick() {
    if (open) {
      close()
    } else {
      setPendingOpen(true)
    }
  }

  const timeColor = isBreak
    ? 'text-emerald-500 dark:text-emerald-400'
    : isPaused
      ? 'text-gray-400 dark:text-gray-500'
      : 'text-gray-900 dark:text-gray-100'

  const glassStyle = isBreak ? glassBreak : glassBase

  const pulseStyle = isRunning ? {
    boxShadow: isBreak
      ? '0 0 0 0 rgba(16,185,129,0.4), 0 8px 32px rgba(16,185,129,0.15)'
      : '0 0 0 0 rgba(239,68,68,0.4), 0 8px 32px rgba(239,68,68,0.15)',
    animation: isBreak ? 'pulse-glow-break 2s ease-in-out infinite' : 'pulse-glow 2s ease-in-out infinite',
  } : undefined

  // idle: tomato-idle (gentle sway); break: tomato-sleep (slow breathe)
  const tomatoAnimation = isBreak
    ? { display: 'inline-flex', animation: 'tomato-sleep 3s ease-in-out infinite', transformOrigin: 'center center' }
    : !isActive
      ? { display: 'inline-flex', animation: 'tomato-idle 20s ease-in-out infinite', transformOrigin: 'center bottom' }
      : undefined

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Popover
        open={open}
        onClose={close}
        align="top-right"
        anchor={
          <button
            onClick={handleFabClick}
            aria-label="Помодоро-таймер"
            aria-expanded={open}
            className={[
              'flex items-center gap-3 transition-all duration-300',
              isActive ? [
                'rounded-full pl-4 pr-5 py-3',
                glassStyle,
                isRunning ? (isBreak ? 'ring-2 ring-emerald-400/40' : 'ring-2 ring-red-400/40') : '',
              ].filter(Boolean).join(' ') : 'rounded-full p-1',
            ].filter(Boolean).join(' ')}
            style={pulseStyle}
          >
            {/* Tomato with sleep Z-overlay */}
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={tomatoAnimation}>
                <TomatoIcon size={isActive ? 36 : 44} />
              </span>

              {/* Sleeping Z letters — only during break */}
              {isBreak && (
                <>
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-6px',
                    fontSize: '10px', fontWeight: 700, color: '#38bdf8',
                    animation: 'tomato-z-float 2.4s linear infinite',
                    animationDelay: '0s',
                    pointerEvents: 'none',
                  }}>z</span>
                  <span style={{
                    position: 'absolute', top: '-10px', right: '-2px',
                    fontSize: '13px', fontWeight: 700, color: '#38bdf8',
                    animation: 'tomato-z-float 2.4s linear infinite',
                    animationDelay: '0.8s',
                    pointerEvents: 'none',
                  }}>Z</span>
                  <span style={{
                    position: 'absolute', top: '-16px', right: '-9px',
                    fontSize: '16px', fontWeight: 700, color: '#38bdf8',
                    animation: 'tomato-z-float 2.4s linear infinite',
                    animationDelay: '1.6s',
                    pointerEvents: 'none',
                  }}>Z</span>
                </>
              )}
            </span>

            {isActive && (
              <span className={['text-lg font-mono font-bold tabular-nums tracking-tight', timeColor].join(' ')}>
                {formatSeconds(state.remainingSeconds)}
              </span>
            )}
            {isRunning && (
              <span className={[
                'h-2.5 w-2.5 rounded-full animate-pulse shrink-0',
                isBreak ? 'bg-emerald-500' : 'bg-red-500',
              ].join(' ')} aria-hidden="true" />
            )}
          </button>
        }
      >
        <PomodoroPanel onClose={close} />
      </Popover>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.12); }
          50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0), 0 8px 40px rgba(239,68,68,0.25); }
        }
        @keyframes pulse-glow-break {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3), 0 8px 32px rgba(16,185,129,0.12); }
          50%       { box-shadow: 0 0 0 8px rgba(16,185,129,0), 0 8px 40px rgba(16,185,129,0.25); }
        }
        @keyframes tomato-sleep {
          0%, 100% { transform: scale(0.95); }
          50%       { transform: scale(1.05); }
        }
        @keyframes tomato-z-float {
          0%   { opacity: 0;   transform: translate(0, 0)      scale(0.6) rotate(-10deg); }
          20%  { opacity: 0.9;                                                             }
          100% { opacity: 0;   transform: translate(14px, -28px) scale(1.2) rotate(15deg); }
        }
      `}</style>
    </div>
  )
}
