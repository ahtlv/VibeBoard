interface DailyGoalRingProps {
  current: number
  goal: number
  size?: number
}

export function DailyGoalRing({ current, goal, size = 56 }: DailyGoalRingProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = goal > 0 ? Math.min(current / goal, 1) : 0
  const dash = circumference * progress
  const gap = circumference - dash

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circumference / 4}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="600"
          fill="currentColor"
          className="text-gray-900 dark:text-gray-100"
        >
          {current}/{goal}
        </text>
      </svg>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">цель дня</span>
    </div>
  )
}
