interface BoardHeaderProps {
  boardName: string
  description: string | null
}

export function BoardHeader({ boardName, description }: BoardHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{boardName}</h1>
      {description && (
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  )
}
