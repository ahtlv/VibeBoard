import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { startSound, type SoundPreset, type ActiveSound } from '../lib/audioEngine'

const PRESETS: { id: SoundPreset; icon: string }[] = [
  { id: 'deepfocus', icon: '🧠' },
  { id: 'rain',      icon: '🌧' },
  { id: 'ocean',     icon: '🌊' },
  { id: 'forest',    icon: '🌿' },
  { id: 'cafe',      icon: '☕' },
  { id: 'fireplace', icon: '🔥' },
]

const ALL_PRESETS = PRESETS.map(p => p.id)
const DEFAULT_VOLUME = 0.45
const FADE_MS = 800

type Volumes = Record<SoundPreset, number>

function initVolumes(): Volumes {
  return Object.fromEntries(ALL_PRESETS.map(id => [id, DEFAULT_VOLUME])) as Volumes
}

export function SoundMixer() {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState<Set<SoundPreset>>(new Set())
  const [volumes, setVolumes] = useState<Volumes>(initVolumes)

  const soundsRef = useRef<Partial<Record<SoundPreset, ActiveSound>>>({})

  const togglePreset = useCallback((id: SoundPreset) => {
    if (!playing) {
      setSelected(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
      return
    }

    if (soundsRef.current[id]) {
      // playing → fade out and remove
      const sound = soundsRef.current[id]!
      delete soundsRef.current[id]
      setSelected(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      sound.fade(0, FADE_MS).then(() => sound.stop())
    } else {
      // not playing → fade in and add
      const sound = startSound(id, 0)
      soundsRef.current[id] = sound
      setSelected(prev => new Set([...prev, id]))
      sound.fade(volumes[id], FADE_MS)
    }
  }, [playing, volumes])

  const togglePlayback = useCallback(() => {
    if (playing) {
      // pause: fade out all
      const active = { ...soundsRef.current }
      soundsRef.current = {}
      for (const [, sound] of Object.entries(active)) {
        sound!.fade(0, FADE_MS).then(() => sound!.stop())
      }
      setPlaying(false)
    } else {
      // play: if nothing selected — default to deepfocus
      const toPlay = selected.size > 0 ? selected : new Set<SoundPreset>(['deepfocus'])
      if (selected.size === 0) setSelected(toPlay)
      for (const id of toPlay) {
        const sound = startSound(id, 0)
        soundsRef.current[id] = sound
        sound.fade(volumes[id], FADE_MS)
      }
      setPlaying(true)
    }
  }, [playing, selected, volumes])

  const handleVolume = useCallback((id: SoundPreset, v: number) => {
    setVolumes(prev => ({ ...prev, [id]: v }))
    if (soundsRef.current[id]) {
      soundsRef.current[id]!.setVolume(v)
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1">
        {PRESETS.map(p => {
          const isSelected = selected.has(p.id)
          return (
            <button
              key={p.id}
              onClick={() => togglePreset(p.id)}
              aria-pressed={isSelected}
              className={[
                'flex items-center justify-center py-1.5 rounded-lg text-base transition-all duration-150',
                isSelected
                  ? 'bg-indigo-500 shadow-sm shadow-indigo-500/30 scale-105'
                  : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10',
              ].join(' ')}
            >
              {p.icon}
            </button>
          )
        })}
      </div>

      {selected.size > 0 && (
        <div className="space-y-1">
          {PRESETS.filter(p => selected.has(p.id)).map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="text-sm w-4 text-center leading-none">{p.icon}</span>
              <input
                type="range" min={0} max={1} step={0.02}
                value={volumes[p.id]}
                onChange={e => handleVolume(p.id, Number(e.target.value))}
                aria-label={t('sounds.volumeOf', { name: p.id })}
                className="flex-1 h-1 accent-indigo-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={togglePlayback}
        className={[
          'w-full rounded-lg py-1.5 text-sm font-semibold transition-all duration-150 active:scale-95',
          playing
            ? 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/15'
            : 'bg-green-500/40 text-green-800 dark:text-green-300 hover:bg-green-500/55',
        ].join(' ')}
      >
        {playing ? `⏸ ${t('sounds.pause')}` : `▶ ${t('sounds.play')}`}
      </button>
    </div>
  )
}
