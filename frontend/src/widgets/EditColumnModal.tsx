import { useRef, useState, type ChangeEvent } from 'react'
import { ModalOverlay } from '@/shared/ui/Modal'
import type { Column } from '@/entities/board/types'
import { DEFAULT_COLUMN_COLORS } from '@/entities/board/columnColors'

interface EditColumnModalProps {
  column: Column
  onSave: (patch: { title: string; color: string | null }) => void
  onDelete: () => void
  onClose: () => void
}

export function EditColumnModal({ column, onSave, onDelete, onClose }: EditColumnModalProps) {
  const [title, setTitle] = useState(column.title)
  const [color, setColor] = useState<string | null>(column.color ?? null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const customInputRef = useRef<HTMLInputElement>(null)

  function handleSave() {
    const trimmed = title.trim()
    if (!trimmed) return
    onSave({ title: trimmed, color })
  }

  function handleCustomColor(e: ChangeEvent<HTMLInputElement>) {
    setColor(e.target.value)
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">Edit column</h2>

      {/* Title */}
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose() }}
        placeholder="Column name…"
        className="mb-4 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />

      {/* Color */}
      <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Color</label>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {/* No color */}
        <button
          type="button"
          title="No color"
          onClick={() => setColor(null)}
          className={[
            'h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center bg-gray-100 dark:bg-gray-800',
            color === null
              ? 'border-indigo-500 scale-110'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
          ].join(' ')}
        >
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>

        {/* Preset swatches */}
        {DEFAULT_COLUMN_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.name}
            onClick={() => setColor(c.value)}
            className={[
              'h-6 w-6 rounded-full border-2 transition-all',
              color === c.value
                ? 'border-indigo-500 scale-110'
                : 'border-transparent hover:scale-105',
            ].join(' ')}
            style={{ backgroundColor: c.value }}
          />
        ))}

        {/* Custom color picker */}
        <button
          type="button"
          title="Custom color"
          onClick={() => customInputRef.current?.click()}
          className={[
            'h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center',
            color !== null && !DEFAULT_COLUMN_COLORS.some((c) => c.value === color)
              ? 'border-indigo-500 scale-110'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 bg-gradient-to-br from-rose-400 via-violet-400 to-sky-400',
          ].join(' ')}
          style={
            color !== null && !DEFAULT_COLUMN_COLORS.some((c) => c.value === color)
              ? { backgroundColor: color }
              : undefined
          }
        >
          {(color === null || DEFAULT_COLUMN_COLORS.some((c) => c.value === color)) && (
            <svg className="h-3 w-3 text-white drop-shadow" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          )}
        </button>
        <input
          ref={customInputRef}
          type="color"
          className="sr-only"
          value={color ?? '#6366f1'}
          onChange={handleCustomColor}
        />
      </div>

      {/* Preview strip */}
      <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {color && <div className="h-1.5 w-full" style={{ backgroundColor: color }} />}
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title.trim() || 'Column name'}
        </div>
      </div>

      {/* Actions */}
      {confirmDelete ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
          <p className="mb-3 text-sm text-red-700 dark:text-red-400">
            Delete <span className="font-medium">«{column.title}»</span>? All tasks inside will be lost.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-md border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete column"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </ModalOverlay>
  )
}
