export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const SIZE_CLASSES = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
} as const

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export function Avatar({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      title={name}
      className={`${sizeClass} flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 font-medium text-indigo-700 dark:text-indigo-300 select-none ${className}`}
    >
      {initials(name)}
    </div>
  )
}
