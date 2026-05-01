import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react'
import { timeEntriesApi, type StopResponse } from '@/shared/api/timeEntriesApi'
import { analyticsApi, type AnalyticsOverview } from '@/shared/api/analyticsApi'
import { achievementsApi, type Achievement } from '@/shared/api/achievementsApi'
import { pomodoroEvents } from '@/shared/lib/pomodoroEvents'
import { toast } from 'sonner'

export const POMODORO_DURATION_SECONDS = 25 * 60
export const BREAK_DURATION_SECONDS = 5 * 60

export type PomodoroPhase = 'work' | 'break'
export type PomodoroStatus = 'idle' | 'running' | 'paused'

export interface PomodoroState {
  phase: PomodoroPhase
  status: PomodoroStatus
  taskId: string | null
  entryId: string | null
  segmentStartMs: number | null
  accumulatedSeconds: number
  elapsedSeconds: number
  remainingSeconds: number
}

type Action =
  | { type: 'RESTORE'; entry: { id: string; task_id: string | null; started_at: string; paused_at: string | null; accumulated_seconds: number } }
  | { type: 'START'; taskId: string | null; entryId: string }
  | { type: 'START_BREAK' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }

function calcElapsed(segmentStartMs: number | null, accumulated: number): number {
  if (!segmentStartMs) return accumulated
  return accumulated + Math.floor((Date.now() - segmentStartMs) / 1000)
}

function totalForPhase(phase: PomodoroPhase): number {
  return phase === 'break' ? BREAK_DURATION_SECONDS : POMODORO_DURATION_SECONDS
}

function reducer(state: PomodoroState, action: Action): PomodoroState {
  switch (action.type) {
    case 'RESTORE': {
      const { entry } = action
      const segmentStartMs = entry.paused_at ? null : new Date(entry.started_at).getTime()
      const accumulated = entry.accumulated_seconds
      const elapsed = calcElapsed(segmentStartMs, accumulated)
      return {
        phase: 'work',
        status: entry.paused_at ? 'paused' : 'running',
        taskId: entry.task_id,
        entryId: entry.id,
        segmentStartMs,
        accumulatedSeconds: accumulated,
        elapsedSeconds: elapsed,
        remainingSeconds: Math.max(0, POMODORO_DURATION_SECONDS - elapsed),
      }
    }
    case 'START':
      return {
        phase: 'work',
        status: 'running',
        taskId: action.taskId,
        entryId: action.entryId,
        segmentStartMs: Date.now(),
        accumulatedSeconds: 0,
        elapsedSeconds: 0,
        remainingSeconds: POMODORO_DURATION_SECONDS,
      }
    case 'START_BREAK':
      return {
        phase: 'break',
        status: 'running',
        taskId: null,
        entryId: null,
        segmentStartMs: Date.now(),
        accumulatedSeconds: 0,
        elapsedSeconds: 0,
        remainingSeconds: BREAK_DURATION_SECONDS,
      }
    case 'TICK': {
      const elapsed = calcElapsed(state.segmentStartMs, state.accumulatedSeconds)
      return {
        ...state,
        elapsedSeconds: elapsed,
        remainingSeconds: Math.max(0, totalForPhase(state.phase) - elapsed),
      }
    }
    case 'PAUSE': {
      const elapsed = calcElapsed(state.segmentStartMs, state.accumulatedSeconds)
      return {
        ...state,
        status: 'paused',
        accumulatedSeconds: elapsed,
        segmentStartMs: null,
        elapsedSeconds: elapsed,
        remainingSeconds: Math.max(0, totalForPhase(state.phase) - elapsed),
      }
    }
    case 'RESUME':
      return {
        ...state,
        status: 'running',
        segmentStartMs: Date.now(),
      }
    case 'STOP':
      return {
        phase: 'work',
        status: 'idle',
        taskId: null,
        entryId: null,
        segmentStartMs: null,
        accumulatedSeconds: 0,
        elapsedSeconds: 0,
        remainingSeconds: POMODORO_DURATION_SECONDS,
      }
    default:
      return state
  }
}

const initialState: PomodoroState = {
  phase: 'work',
  status: 'idle',
  taskId: null,
  entryId: null,
  segmentStartMs: null,
  accumulatedSeconds: 0,
  elapsedSeconds: 0,
  remainingSeconds: POMODORO_DURATION_SECONDS,
}

interface PomodoroContextValue {
  state: PomodoroState
  todayStats: AnalyticsOverview | null
  achievements: Achievement[] | null
  start: (taskId?: string | null) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  stop: () => Promise<StopResponse | null>
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

const DEFAULT_TITLE = document.title

function playGong() {
  const audio = new Audio('/sounds/gong.mp3')
  audio.play().catch(() => {})
}

function showCompletionNotification() {
  if (Notification.permission === 'granted') {
    new Notification('🍅 Сессия завершена!', {
      body: 'Отличная работа! Время отдохнуть.',
      icon: '/favicon.ico',
    })
  }
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [todayStats, setTodayStats] = useState<AnalyticsOverview | null>(null)
  const [achievements, setAchievements] = useState<Achievement[] | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)
  const breakCompletedRef = useRef(false)
  // Ref to read current phase inside async functions without stale closure
  const phaseRef = useRef<PomodoroPhase>('work')
  useEffect(() => { phaseRef.current = state.phase }, [state.phase])

  const fetchStats = useCallback(() => {
    analyticsApi.getOverview().then(setTodayStats).catch(() => {})
  }, [])

  const fetchAchievements = useCallback(() => {
    achievementsApi.list().then(setAchievements).catch(() => {})
  }, [])

  // Prefetch all panel data on mount so the popover opens with data ready
  useEffect(() => {
    fetchStats()
    fetchAchievements()

    const poll = setInterval(fetchStats, 30_000)
    const offStop = pomodoroEvents.on('pomodoroStop', () => {
      fetchStats()
      fetchAchievements()
    })
    const offTask = pomodoroEvents.on('taskDone', fetchStats)

    return () => {
      clearInterval(poll)
      offStop()
      offTask()
    }
  }, [fetchStats, fetchAchievements])

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true

    document.title = DEFAULT_TITLE

    try {
      const result = await timeEntriesApi.stop()
      pomodoroEvents.emit('pomodoroStop')
      playGong()
      showCompletionNotification()
      toast.success('🍅 Сессия завершена!', { description: '25 минут позади. Бери перерыв!' })
      for (const a of result.unlocked_achievements ?? []) {
        toast.success(`${a.icon} ${a.title}`, { description: a.description })
      }
      breakCompletedRef.current = false
      dispatch({ type: 'START_BREAK' })
    } catch {
      dispatch({ type: 'STOP' })
    }
  }, [])

  // Restore active session on mount
  useEffect(() => {
    timeEntriesApi.getActive().then((entry) => {
      if (entry && entry.status === 'active') {
        dispatch({ type: 'RESTORE', entry })
      }
    }).catch(() => {/* silent */})
  }, [])

  // Tick while running
  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (state.status === 'idle') {
        document.title = DEFAULT_TITLE
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.status])

  // Update document.title and detect completion for both phases
  useEffect(() => {
    if (state.status === 'running' || state.status === 'paused') {
      const emoji = state.phase === 'break' ? '☕' : '🍅'
      const m = String(Math.floor(state.remainingSeconds / 60)).padStart(2, '0')
      const s = String(state.remainingSeconds % 60).padStart(2, '0')
      document.title = `${emoji} ${m}:${s} — VibeBoard`
    }

    // Work session complete → auto-start break
    if (state.phase === 'work' && state.status === 'running' && state.remainingSeconds === 0) {
      handleComplete()
    }

    // Break complete → back to idle
    if (state.phase === 'break' && state.status === 'running' && state.remainingSeconds === 0) {
      if (breakCompletedRef.current) return
      breakCompletedRef.current = true
      dispatch({ type: 'STOP' })
      document.title = DEFAULT_TITLE
      playGong()
      toast.success('☕ Перерыв окончен!', { description: 'Готов продолжать?' })
    }
  }, [state.phase, state.status, state.remainingSeconds, handleComplete])

  async function start(taskId?: string | null) {
    completedRef.current = false
    breakCompletedRef.current = false
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {/* silent */})
    }
    const entry = await timeEntriesApi.start(taskId ?? null)
    dispatch({ type: 'START', taskId: taskId ?? null, entryId: entry.id })
  }

  async function pause() {
    dispatch({ type: 'PAUSE' })
    // Break has no backend entry — skip API call
    if (phaseRef.current === 'work') {
      await timeEntriesApi.pause().catch(() => {/* silent */})
    }
  }

  async function resume() {
    completedRef.current = false
    dispatch({ type: 'RESUME' })
    if (phaseRef.current === 'work') {
      await timeEntriesApi.resume().catch(() => {/* silent */})
    }
  }

  async function stop(): Promise<StopResponse | null> {
    dispatch({ type: 'STOP' })
    document.title = DEFAULT_TITLE
    // Break has no backend entry — just reset state
    if (phaseRef.current === 'break') {
      return null
    }
    try {
      const result = await timeEntriesApi.stop()
      pomodoroEvents.emit('pomodoroStop')
      for (const a of result.unlocked_achievements ?? []) {
        toast.success(`${a.icon} ${a.title}`, { description: a.description })
      }
      return result
    } catch {
      return null
    }
  }

  return (
    <PomodoroContext.Provider value={{ state, todayStats, achievements, start, pause, resume, stop }}>
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used inside PomodoroProvider')
  return ctx
}
