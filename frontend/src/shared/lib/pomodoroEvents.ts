type PomodoroEventType = 'pomodoroStop' | 'taskDone'

const listeners = new Map<PomodoroEventType, Set<() => void>>()

export const pomodoroEvents = {
  on(event: PomodoroEventType, fn: () => void) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(fn)
    return () => listeners.get(event)?.delete(fn)
  },
  emit(event: PomodoroEventType) {
    listeners.get(event)?.forEach((fn) => fn())
  },
}
