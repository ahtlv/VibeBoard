import { usePomodoro } from '../model/PomodoroProvider'
import { useTodayStats } from '../model/useTodayStats'
import { TodayStats } from './TodayStats'
import { AchievementsGrid } from './AchievementsGrid'
import { SoundMixer } from './SoundMixer'
import { formatSeconds } from '../lib/format'

const glass = [
  'bg-white/40 dark:bg-gray-900/50',
  'backdrop-blur-2xl backdrop-saturate-150',
  'border border-white/30 dark:border-white/8',
].join(' ')

const divider = 'mx-4 h-px bg-black/8 dark:bg-white/8'

interface PomodoroP { onClose?: () => void }

export function PomodoroPanel({ onClose: _onClose }: PomodoroP) {
  const { state, start, pause, resume, stop } = usePomodoro()
  const { data: stats } = useTodayStats()

  const isRunning = state.status === 'running'
  const isPaused  = state.status === 'paused'
  const isActive  = isRunning || isPaused

  return (
    <div className={['w-[340px] rounded-3xl overflow-hidden shadow-2xl shadow-black/20', glass].join(' ')}>

      {/* ── 1. Sounds (top, furthest from button) ── */}
      <div className="px-5 pt-4 pb-3">
        <SoundMixer />
      </div>

      <div className={divider} />

      {/* ── 2. Achievements ── */}
      <div className="px-5 py-3">
        <AchievementsGrid />
      </div>

      <div className={divider} />

      {/* ── 3. Today stats ── */}
      <div className="px-5 py-3">
        <TodayStats data={stats} />
      </div>

      <div className={divider} />

      {/* ── 4. Timer (closest to button) ── */}
      <div className="flex flex-col items-center pt-4 pb-5 px-6 gap-1">
        <p className={[
          'text-5xl font-mono font-bold tabular-nums tracking-tight leading-none mt-1',
          isActive ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500',
        ].join(' ')}>
          {formatSeconds(state.remainingSeconds)}
        </p>

        <div className="flex w-full gap-2 mt-3">
          {!isActive && (
            <button
              onClick={() => start()}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold py-2.5 text-sm transition-all duration-150 shadow-md shadow-red-500/30"
            >
              ▶ Start
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={pause} className="flex-1 rounded-xl bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 font-semibold py-2.5 text-sm transition-all">
                ⏸ Pause
              </button>
              <button onClick={stop} className="flex-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 font-semibold py-2.5 text-sm transition-all">
                ⏹ Stop
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={resume} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold py-2.5 text-sm transition-all">
                ▶ Resume
              </button>
              <button onClick={stop} className="flex-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 font-semibold py-2.5 text-sm transition-all">
                ⏹ Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
