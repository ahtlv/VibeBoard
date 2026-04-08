interface BoardHeaderProps {
  boardName: string
  workspaceName: string
  onAddColumn: () => void
  onAddTask: () => void
}

export function BoardHeader({ boardName, workspaceName, onAddColumn, onAddTask }: BoardHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{boardName}</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{workspaceName}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAddTask}
          className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          + Add task
        </button>
        <button
          onClick={onAddColumn}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + Add column
        </button>
      </div>
    </div>
  )
}
