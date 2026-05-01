import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface DayData {
  date: string   // YYYY-MM-DD
  count: number
}

interface ActivityHeatmapProps {
  data: DayData[]
  totalCompleted: number
}

// ── helpers ───────────────────────────────────────────────────────────────────

function buildGrid(data: DayData[], lang: string): { weeks: (DayData | null)[][]; months: { label: string; colStart: number }[] } {
  const countMap = new Map(data.map((d) => [d.date, d.count]))

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setUTCDate(startDate.getUTCDate() - 364)
  // Align to Monday: (day + 6) % 7 = days since last Monday (Sun→6, Mon→0, …, Sat→5)
  startDate.setUTCDate(startDate.getUTCDate() - ((startDate.getUTCDay() + 6) % 7))

  const weeks: (DayData | null)[][] = []
  const monthsSeen = new Set<string>()
  const months: { label: string; colStart: number }[] = []

  let current = new Date(startDate)
  let weekIdx = 0

  while (current <= today) {
    const week: (DayData | null)[] = []
    for (let d = 0; d < 7; d++) {
      if (current > today) {
        week.push(null)
      } else {
        const key = current.toISOString().slice(0, 10)
        week.push({ date: key, count: countMap.get(key) ?? 0 })

        const monthKey = `${current.getUTCFullYear()}-${current.getUTCMonth()}`
        if (!monthsSeen.has(monthKey) && current.getUTCDate() <= 7) {
          monthsSeen.add(monthKey)
          months.push({
            label: current.toLocaleDateString(lang, { month: 'short', timeZone: 'UTC' }),
            colStart: weekIdx,
          })
        }
      }
      current.setUTCDate(current.getUTCDate() + 1)
    }
    weeks.push(week)
    weekIdx++
  }

  return { weeks, months }
}

function colorLevel(count: number): string {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (count === 1) return 'bg-indigo-200 dark:bg-indigo-900'
  if (count <= 3) return 'bg-indigo-400 dark:bg-indigo-700'
  if (count <= 6) return 'bg-indigo-600 dark:bg-indigo-500'
  return 'bg-indigo-800 dark:bg-indigo-400'
}

// Jan 1, 2024 is Monday — use as anchor to generate Mon-Sun day labels
function getDayLabels(lang: string): string[] {
  const monday = new Date('2024-01-01')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toLocaleDateString(lang, { weekday: 'short' })
  })
}

// ── component ─────────────────────────────────────────────────────────────────

export function ActivityHeatmap({ data, totalCompleted }: ActivityHeatmapProps) {
  const { t, i18n } = useTranslation()
  const { weeks, months } = useMemo(() => buildGrid(data, i18n.language), [data, i18n.language])
  const dayLabels = useMemo(() => getDayLabels(i18n.language), [i18n.language])

  const maxCount = data.reduce((m, d) => Math.max(m, d.count), 0)

  // Reversed layout: today on the left, oldest on the right
  const totalWeeks = weeks.length
  const displayWeeks = useMemo(() => [...weeks].reverse(), [weeks])
  const displayMonths = useMemo(() => {
    return months
      .map((m, i) => {
        const span = (months[i + 1]?.colStart ?? totalWeeks) - m.colStart
        return { label: m.label, colStart: totalWeeks - m.colStart - span }
      })
      .sort((a, b) => a.colStart - b.colStart)
  }, [months, totalWeeks])

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCompleted}</span>
          {' '}{t('calendar.heatmapLabel')}
        </p>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <span>{t('calendar.less')}</span>
          {[0, 1, 2, 4, 7].map((n) => (
            <div key={n} className={`h-3 w-3 rounded-sm ${colorLevel(n)}`} />
          ))}
          <span>{t('calendar.more')}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {/* Month labels — ширина колонки = w-3 (12px) + gap-0.5 (2px) = 14px */}
          <div className="mb-1 flex" style={{ paddingLeft: 28 }}>
            {displayMonths.map((m, i) => {
              const nextCol = displayMonths[i + 1]?.colStart ?? totalWeeks
              const span = nextCol - m.colStart
              if (span < 2) return null
              return (
                <div
                  key={`${m.label}-${m.colStart}`}
                  className="text-[10px] text-gray-400 dark:text-gray-500 overflow-hidden"
                  style={{ width: span * 14 }}
                >
                  {m.label}
                </div>
              )
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 pr-1" style={{ width: 28 }}>
              {dayLabels.map((d, i) => (
                <div
                  key={d}
                  className="text-[10px] text-gray-400 dark:text-gray-500 leading-none"
                  style={{ height: 14, visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks grid */}
            {displayWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day && day.count > 0
                      ? t('calendar.heatmapTooltip', {
                          count: day.count,
                          date: new Date(day.date + 'T00:00:00Z').toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
                        })
                      : ''}
                    className={[
                      'h-3 w-3 rounded-sm transition-colors',
                      day ? colorLevel(day.count) : 'bg-transparent',
                      day && day.count > 0 ? 'cursor-pointer hover:ring-1 hover:ring-indigo-400 dark:hover:ring-indigo-500' : '',
                    ].join(' ')}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Max streak note */}
      {maxCount > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t('calendar.heatmapPeak', { count: maxCount })}
        </p>
      )}

    </div>
  )
}
