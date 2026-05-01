export type SoundPreset = 'rain' | 'ocean' | 'cafe' | 'forest' | 'fireplace' | 'deepfocus'

export interface ActiveSound {
  stop: () => void
  setVolume: (v: number) => void
  fade: (target: number, durationMs: number) => Promise<void>
}

const SOUND_FILES: Record<SoundPreset, string> = {
  rain: '/sounds/rain.mp3',
  ocean: '/sounds/ocean.mp3',
  forest: '/sounds/forest.mp3',
  cafe: '/sounds/cafe.mp3',
  fireplace: '/sounds/bonfire.mp3',
  deepfocus: '/sounds/binaural-40hz-1min.wav',
}

const STEP_MS = 25

export function startSound(preset: SoundPreset, initialVolume: number): ActiveSound {
  const audio = new Audio(SOUND_FILES[preset])
  audio.loop = true
  audio.volume = Math.max(0, Math.min(1, initialVolume))
  audio.play().catch(() => {})

  let fadeTimer: ReturnType<typeof setInterval> | null = null

  const clearFade = () => {
    if (fadeTimer !== null) {
      clearInterval(fadeTimer)
      fadeTimer = null
    }
  }

  const fade = (target: number, durationMs: number): Promise<void> => {
    clearFade()
    const clampedTarget = Math.max(0, Math.min(1, target))
    return new Promise(resolve => {
      const steps = Math.max(1, Math.round(durationMs / STEP_MS))
      const delta = (clampedTarget - audio.volume) / steps
      let step = 0
      fadeTimer = setInterval(() => {
        step++
        if (step >= steps) {
          audio.volume = clampedTarget
          clearFade()
          resolve()
        } else {
          audio.volume = Math.max(0, Math.min(1, audio.volume + delta))
        }
      }, STEP_MS)
    })
  }

  return {
    stop: () => {
      clearFade()
      audio.pause()
      audio.src = ''
    },
    setVolume: (v) => {
      clearFade()
      audio.volume = Math.max(0, Math.min(1, v))
    },
    fade,
  }
}
