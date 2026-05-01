export type TomatoState = 'idle' | 'focus' | 'celebrate'

interface TomatoIconProps {
  size?: number
  className?: string
  state?: TomatoState
}

export function TomatoIcon({ size = 24, className = '', state: _state = 'idle' }: TomatoIconProps) {
  const id = `tg-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 6px rgba(239,68,68,0.35))' }}
    >
      <defs>
        <linearGradient id={id} x1="10" y1="8" x2="22" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>

      {/* Left leaf */}
      <path
        d="M16 6 C16 6 11 3 8.5 6 C11 5.5 13.5 7 16 7.5Z"
        fill="#22c55e"
      />
      {/* Right leaf */}
      <path
        d="M16 6 C16 6 21 3 23.5 6 C21 5.5 18.5 7 16 7.5Z"
        fill="#16a34a"
      />
      {/* Stem */}
      <line x1="16" y1="5.5" x2="16" y2="9" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />

      {/* Body */}
      <circle cx="16" cy="19" r="10.5" fill={`url(#${id})`} />

      {/* Main shine */}
      <ellipse cx="12.5" cy="14" rx="2.5" ry="1.8" fill="white" fillOpacity="0.28" transform="rotate(-20 12.5 14)" />
      {/* Small secondary shine */}
      <circle cx="18" cy="13" r="1" fill="white" fillOpacity="0.18" />
    </svg>
  )
}
