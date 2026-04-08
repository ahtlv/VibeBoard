import type { Task } from '@/entities/task/types'
import type { Label } from '@/entities/label/types'

export interface Column {
  id: string
  boardId: string
  title: string
  position: number
  tasks: Task[]
}

export interface Board {
  id: string
  workspaceId: string
  title: string
  description: string | null
  columns: Column[]
  labels: Label[]
  createdAt: string
  updatedAt: string
}
