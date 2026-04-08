import { apiClient } from './client'
import type { Task } from '@/entities/task/types'
import type { TaskStatus, Priority } from '@/shared/types/task'

// ── request DTOs ──────────────────────────────────────────────────────────────

export interface CreateTaskRequest {
  columnId: string
  title: string
  description?: string
  priority?: Priority
  dueDate?: string
  position?: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  dueDate?: string | null
  assigneeIds?: string[]
}

export interface MoveTaskRequest {
  columnId: string
  position: number
}

// ── api ───────────────────────────────────────────────────────────────────────

export const tasksApi = {
  /** POST /columns/:columnId/tasks — создать задачу в колонке */
  createTask: (body: CreateTaskRequest): Promise<Task> =>
    apiClient.post<Task>(`/columns/${body.columnId}/tasks`, {
      title: body.title,
      description: body.description,
      priority: body.priority,
      due_date: body.dueDate,
      position: body.position,
    }),

  /** PATCH /tasks/:taskId — частичное обновление задачи */
  updateTask: (taskId: string, body: UpdateTaskRequest): Promise<Task> =>
    apiClient.patch<Task>(`/tasks/${taskId}`, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      due_date: body.dueDate,
      assignee_ids: body.assigneeIds,
    }),

  /** DELETE /tasks/:taskId — удалить задачу */
  deleteTask: (taskId: string): Promise<void> =>
    apiClient.delete<void>(`/tasks/${taskId}`),

  /** POST /tasks/:taskId/move — переместить задачу в другую колонку */
  moveTask: (taskId: string, body: MoveTaskRequest): Promise<Task> =>
    apiClient.post<Task>(`/tasks/${taskId}/move`, {
      column_id: body.columnId,
      position: body.position,
    }),
}
