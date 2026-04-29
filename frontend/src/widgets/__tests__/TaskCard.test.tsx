import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskCard } from '../TaskCard'
import type { Task } from '@/entities/task/types'

// ── factory ───────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    boardId: 'board-1',
    columnId: 'col-1',
    title: 'Fix login bug',
    description: null,
    status: 'todo',
    priority: 'medium',
    position: 0,
    dueDate: null,
    labels: [],
    checklists: [],
    assigneeIds: [],
    totalTrackedSeconds: 0,
    pomodoroSessionsCount: 0,
    recurring: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('TaskCard', () => {
  describe('title', () => {
    it('renders task title', () => {
      render(<TaskCard members={[]} task={makeTask({ title: 'Write release notes' })} />)
      expect(screen.getByText('Write release notes')).toBeInTheDocument()
    })
  })

  describe('priority', () => {
    it('renders priority badge text', () => {
      render(<TaskCard members={[]} task={makeTask({ priority: 'high' })} />)
      expect(screen.getByText('high')).toBeInTheDocument()
    })

    it.each(['low', 'medium', 'high', 'urgent'] as const)(
      'renders priority "%s"',
      (priority) => {
        render(<TaskCard members={[]} task={makeTask({ priority })} />)
        expect(screen.getByText(priority)).toBeInTheDocument()
      },
    )
  })

  describe('due date', () => {
    it('renders formatted future due date', () => {
      // Фиксированная дата в далёком будущем — никогда не станет overdue
      render(<TaskCard members={[]} task={makeTask({ dueDate: '2099-06-15T00:00:00Z' })} />)
      expect(screen.getByText(/jun 15/i)).toBeInTheDocument()
    })

    it('shows overdue indicator for past due date', () => {
      render(<TaskCard members={[]} task={makeTask({ dueDate: '2020-01-01T00:00:00Z' })} />)
      // Компонент добавляет "⚠ " перед датой при overdue
      const dateEl = screen.getByText(/jan 1/i)
      expect(dateEl.textContent).toMatch(/⚠/)
    })

    it('hides due date when null', () => {
      render(<TaskCard members={[]} task={makeTask({ dueDate: null })} />)
      // Никакого элемента с датой быть не должно
      expect(screen.queryByText(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)).not.toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('calls onClick when card is clicked', async () => {
      const handleClick = vi.fn()
      render(<TaskCard members={[]} task={makeTask()} onClick={handleClick} />)
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('has no button role when onClick is not provided', () => {
      render(<TaskCard members={[]} task={makeTask()} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
