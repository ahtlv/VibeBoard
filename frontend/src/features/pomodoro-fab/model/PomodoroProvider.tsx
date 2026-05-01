import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { timeEntriesApi, type StopResponse } from '@/shared/api/timeEntriesApi'
import { pomodoroEvents } from '@/shared/lib/pomodoroEvents'
import { toast } from 'sonner'

export const POMODORO_DURATION_SECONDS = 25 * 60

export type PomodoroStatus = 'idle' | 'running' | 'paused'

export interface PomodoroState {
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
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }

function calcElapsed(segmentStartMs: number | null, accumulated: number): number {
  if (!segmentStartMs) return accumulated
  return accumulated + Math.floor((Date.now() - segmentStartMs) / 1000)
}

function reducer(state: PomodoroState, action: Action): PomodoroState {
  switch (action.type) {
    case 'RESTORE': {
      const { entry } = action
      const segmentStartMs = entry.paused_at ? null : new Date(entry.started_at).getTime()
      const accumulated = entry.accumulated_seconds
      const elapsed = calcElapsed(segmentStartMs, accumulated)
      return {
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
        status: 'running',
        taskId: action.taskId,
        entryId: action.entryId,
        segmentStartMs: Date.now(),
        accumulatedSeconds: 0,
        elapsedSeconds: 0,
        remainingSeconds: POMODORO_DURATION_SECONDS,
      }
    case 'TICK': {
      const elapsed = calcElapsed(state.segmentStartMs, state.accumulatedSeconds)
      return {
        ...state,
        elapsedSeconds: elapsed,
        remainingSeconds: Math.max(0, POMODORO_DURATION_SECONDS - elapsed),
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
        remainingSeconds: Math.max(0, POMODORO_DURATION_SECONDS - elapsed),
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
  start: (taskId?: string | null) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  stop: () => Promise<StopResponse | null>
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

const DEFAULT_TITLE = document.title

function showCompletionNotification() {
  if (Notification.permission === 'granted') {
    new Notification('🍅 Focus session complete!', {
      body: "Great work! Time for a break.",
      icon: '/favicon.ico',
    })
  }
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true

    dispatch({ type: 'STOP' })
    document.title = DEFAULT_TITLE

    try {
      const result = await timeEntriesApi.stop()
      pomodoroEvents.emit('pomodoroStop')
      showCompletionNotification()
      toast.success('🍅 Focus session complete!', { description: "25 minutes done. Take a break!" })
      for (const a of result.unlocked_achievements ?? []) {
        toast.success(`${a.icon} ${a.title}`, { description: a.description })
      }
    } catch {
      // silent
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

  // Tick + document.title while running
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

  // Update document.title and detect completion
  useEffect(() => {
    if (state.status === 'running' || state.status === 'paused') {
      const m = String(Math.floor(state.remainingSeconds / 60)).padStart(2, '0')
      const s = String(state.remainingSeconds % 60).padStart(2, '0')
      document.title = `🍅 ${m}:${s} — VibeBoard`
    }
    if (state.status === 'running' && state.remainingSeconds === 0) {
      handleComplete()
    }
  }, [state.status, state.remainingSeconds, handleComplete])

  async function start(taskId?: string | null) {
    completedRef.current = false
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {/* silent */})
    }
    const entry = await timeEntriesApi.start(taskId ?? null)
    dispatch({ type: 'START', taskId: taskId ?? null, entryId: entry.id })
  }

  async function pause() {
    dispatch({ type: 'PAUSE' })
    await timeEntriesApi.pause().catch(() => {/* silent */})
  }

  async function resume() {
    completedRef.current = false
    dispatch({ type: 'RESUME' })
    await timeEntriesApi.resume().catch(() => {/* silent */})
  }

  async function stop(): Promise<StopResponse | null> {
    dispatch({ type: 'STOP' })
    document.title = DEFAULT_TITLE
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
    <PomodoroContext.Provider value={{ state, start, pause, resume, stop }}>
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used inside PomodoroProvider')
  return ctx
}
