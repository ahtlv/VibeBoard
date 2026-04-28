import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

// Рендерится через портал в document.body, чтобы выйти из stacking context
// сайдбара (у него transition-transform, что ломает fixed-позиционирование).
// Оверлей начинается под хедером (top-14), блюрит только контент.

interface ModalOverlayProps {
  children: ReactNode
  onClose: () => void
  wide?: boolean
}

export function ModalOverlay({ children, onClose, wide = false }: ModalOverlayProps) {
  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 top-14 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${wide ? 'max-w-md' : 'max-w-sm'} rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
