import type { TaskStatus, Priority } from '@/shared/types/task'
import type { Label } from '@/entities/label/types'

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  position: number
}

export interface Checklist {
  id: string
  taskId: string
  title: string
  items: ChecklistItem[]
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly'

export interface RecurringSettings {
  frequency: RecurringFrequency
  interval: number
  endsAt: string | null
}

export interface Task {
  id: string
  columnId: string
  boardId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  position: number
  dueDate: string | null
  labels: Label[]
  checklists: Checklist[]
  assigneeIds: string[]
  totalTrackedSeconds: number
  pomodoroSessionsCount: number
  recurring: RecurringSettings | null
  bgColor?: string | null
  createdAt: string
  updatedAt: string
}
