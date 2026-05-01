import { useEffect, useRef, useState, type ReactNode } from 'react'

interface PopoverProps {
  open: boolean
  onClose: () => void
  anchor: ReactNode
  children: ReactNode
  align?: 'bottom-right' | 'bottom-left' | 'top-right'
  className?: string
}

const originByAlign = {
  'bottom-right': 'top right',
  'bottom-left': 'top left',
  'top-right': 'bottom right',
} as const

export function Popover({ open, onClose, anchor, children, align = 'bottom-right', className }: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    // Two-frame trick: mount first, then flip to visible so transition fires
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const alignClass =
    align === 'bottom-right' ? 'right-0 top-full mt-2' :
    align === 'bottom-left' ? 'left-0 top-full mt-2' :
    'right-0 bottom-full mb-2'

  return (
    <div ref={containerRef} className="relative">
      {anchor}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className={['absolute z-50', alignClass, className].filter(Boolean).join(' ')}
          style={{
            transformOrigin: originByAlign[align],
            transform: visible ? 'scale(1)' : 'scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: 'transform 200ms ease-out, opacity 200ms ease-out',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
