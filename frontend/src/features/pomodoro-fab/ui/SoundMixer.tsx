import { useState, useRef, useCallback } from 'react'
import { startSound, type SoundPreset } from '../lib/audioEngine'

interface Preset {
  id: SoundPreset
  label: string
  icon: string
  desc: string
}

const PRESETS: Preset[] = [
  { id: 'rain',      label: 'Rain',        icon: '🌧', desc: 'Layered rain + distant rumble' },
  { id: 'ocean',     label: 'Ocean',       icon: '🌊', desc: 'Slow breathing waves'          },
  { id: 'forest',    label: 'Forest',      icon: '🌿', desc: 'Wind & bird chirps'            },
  { id: 'cafe',      label: 'Café',        icon: '☕', desc: 'Warm ambient chatter'          },
  { id: 'fireplace', label: 'Fireplace',   icon: '🔥', desc: 'Crackling wood fire'           },
  { id: 'deepfocus', label: 'Deep Focus',  icon: '🎵', desc: '432 Hz drone + alpha waves'    },
]

export function SoundMixer() {
  const [active, setActive] = useState<SoundPreset | null>(null)
  const [volume, setVolume] = useState(0.45)
  const soundRef = useRef<ReturnType<typeof startSound> | null>(null)

  const select = useCallback((id: SoundPreset) => {
    soundRef.current?.stop()
    soundRef.current = null

    if (active === id) {
      setActive(null)
      return
    }
    setActive(id)
    soundRef.current = startSound(id, volume)
  }, [active, volume])

  const handleVolume = useCallback((v: number) => {
    setVolume(v)
    soundRef.current?.setVolume(v)
  }, [])

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            title={p.desc}
            aria-pressed={active === p.id}
            className={[
              'flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-all duration-150',
              active === p.id
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105'
                : 'bg-white/20 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10',
            ].join(' ')}
          >
            <span className="text-base leading-none">{p.icon}</span>
            <span className="leading-none text-[10px]">{p.label}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="flex items-center gap-2.5 px-0.5">
          <span className="text-base">🔊</span>
          <input
            type="range" min={0} max={1} step={0.02}
            value={volume}
            onChange={e => handleVolume(Number(e.target.value))}
            aria-label="Volume"
            className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}
