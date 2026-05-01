import { usePomodoro } from '../model/PomodoroProvider'
import { TodayStats } from './TodayStats'
import { AchievementsGrid } from './AchievementsGrid'
import { formatSeconds } from '../lib/format'

const glass = [
  'bg-white/40 dark:bg-gray-900/50',
  'backdrop-blur-2xl backdrop-saturate-150',
  'border border-white/30 dark:border-white/8',
].join(' ')

const divider = 'mx-4 h-px bg-black/8 dark:bg-white/8'

interface PomodoroP { onClose?: () => void }

export function PomodoroPanel({ onClose: _onClose }: PomodoroP) {
  const { state, start, pause, resume, stop, todayStats, achievements } = usePomodoro()

  const isRunning = state.status === 'running'
  const isPaused  = state.status === 'paused'
  const isActive  = isRunning || isPaused
  const isBreak   = state.phase === 'break'

  const timerColor = isBreak && isActive
    ? 'text-emerald-500 dark:text-emerald-400'
    : isActive
      ? 'text-gray-900 dark:text-gray-50'
      : 'text-gray-400 dark:text-gray-500'

  return (
    <div className={['w-[340px] rounded-3xl overflow-hidden shadow-2xl shadow-black/20', glass].join(' ')}>

      {/* ── 1. Achievements ── */}
      <div className="px-5 py-3">
        <AchievementsGrid items={achievements} />
      </div>

      <div className={divider} />

      {/* ── 2. Today stats ── */}
      <div className="px-5 py-3">
        <TodayStats data={todayStats} />
      </div>

      <div className={divider} />

      {/* ── 3. Timer ── */}
      <div className="flex flex-col items-center pt-3 pb-5 px-6 gap-1">
        {/* Phase label */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
          {isBreak ? '☕ Перерыв' : '🍅 Работа'}
        </p>

        <p className={['text-5xl font-mono font-bold tabular-nums tracking-tight leading-none', timerColor].join(' ')}>
          {formatSeconds(state.remainingSeconds)}
        </p>

        <div className="flex w-full gap-2 mt-3">
          {!isActive && (
            <button
              onClick={() => start()}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold py-2.5 text-sm transition-all duration-150 shadow-md shadow-red-500/30"
            >
              ▶ Старт
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={pause} className="flex-1 rounded-xl bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 font-semibold py-2.5 text-sm transition-all">
                ⏸ Пауза
              </button>
              <button onClick={stop} className={[
                'flex-1 rounded-xl font-semibold py-2.5 text-sm transition-all',
                isBreak
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400',
              ].join(' ')}>
                {isBreak ? '⏭ Пропустить' : '⏹ Стоп'}
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={resume} className={[
                'flex-1 rounded-xl active:scale-95 text-white font-semibold py-2.5 text-sm transition-all',
                isBreak ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600',
              ].join(' ')}>
                ▶ Продолжить
              </button>
              <button onClick={stop} className={[
                'flex-1 rounded-xl font-semibold py-2.5 text-sm transition-all',
                isBreak
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400',
              ].join(' ')}>
                {isBreak ? '⏭ Пропустить' : '⏹ Стоп'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
