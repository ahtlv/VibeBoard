import type { Achievement } from '@/shared/api/achievementsApi'

const LEGENDARY_ID = 'pomodoro_500'

const skeletonTile = 'rounded-xl aspect-square bg-white/10 dark:bg-white/5 animate-pulse'

interface AchievementsGridProps {
  items: Achievement[] | null
}

export function AchievementsGrid({ items }: AchievementsGridProps) {
  if (items === null) {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={skeletonTile} />
        ))}
        <div className={skeletonTile} />
      </div>
    )
  }

  if (items.length === 0) return null

  const regular = items.filter(a => a.id !== LEGENDARY_ID)
  const legendary = items.find(a => a.id === LEGENDARY_ID)

  // 4-col grid: 7 regular tiles + 1 legendary spanning 2 cols on its own row
  // Layout: row 1 = [t1][t2][t3][t4], row 2 = [t5][t6][t7][👑👑]
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {regular.map(a => <AchievementTile key={a.id} a={a} />)}
      {legendary && <LegendaryTile a={legendary} />}
    </div>
  )
}

function AchievementTile({ a }: { a: Achievement }) {
  const unlocked = !!a.unlocked_at
  const tooltip = `${a.title}\n${a.description}${a.threshold > 0 ? `\n${a.progress}/${a.threshold}` : ''}`

  return (
    <div
      title={tooltip}
      className={[
        'relative flex flex-col items-center justify-center rounded-xl aspect-square cursor-default select-none transition-all duration-150 hover:scale-110',
        unlocked
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md shadow-yellow-500/30'
          : 'bg-white/10 dark:bg-white/5 opacity-50 grayscale',
      ].join(' ')}
      style={unlocked ? { filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.5))' } : undefined}
    >
      <span className={unlocked ? 'text-2xl' : 'text-xl'}>{a.icon}</span>
      {unlocked && <span className="absolute top-1 right-1.5 text-[8px] font-bold text-white/80">✓</span>}
      {!unlocked && a.threshold > 0 && (
        <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5 leading-none">
          {a.progress}/{a.threshold}
        </span>
      )}
    </div>
  )
}

function LegendaryTile({ a }: { a: Achievement }) {
  const unlocked = !!a.unlocked_at
  const tooltip = `${a.title} — ${a.description}\n${a.progress}/${a.threshold}`

  return (
    <div
      title={tooltip}
      className={[
        'relative flex flex-col items-center justify-center rounded-xl aspect-square cursor-default select-none transition-all duration-150 hover:scale-110 overflow-hidden',
        !unlocked && 'opacity-60 grayscale',
      ].filter(Boolean).join(' ')}
      style={unlocked ? {
        background: 'linear-gradient(135deg, #7c3aed, #db2777, #f59e0b)',
        filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.5))',
      } : { background: 'rgba(255,255,255,0.06)' }}
    >
      {unlocked && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
            animation: 'legendary-shine 3s ease-in-out infinite',
          }}
        />
      )}
      <span className={['relative z-10', unlocked ? 'text-2xl' : 'text-xl'].join(' ')}>{a.icon}</span>
      {unlocked && <span className="absolute top-1 right-1.5 text-[8px] font-bold text-white/80 z-10">✓</span>}
      {!unlocked && (
        <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5 leading-none z-10">
          {a.progress}/{a.threshold}
        </span>
      )}
    </div>
  )
}
