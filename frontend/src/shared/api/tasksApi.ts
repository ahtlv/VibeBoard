import { apiClient } from './client'
import type { Task } from '@/entities/task/types'
import type { TaskStatus, Priority } from '@/shared/types/task'

// ── backend response (snake_case) ─────────────────────────────────────────────

export interface TaskApiResponse {
  id: string
  board_id: string
  column_id: string
  created_by: string | null
  title: string
  description: string | null
  position: number
  status: TaskStatus
  priority: Priority
  due_date: string | null
  bg_color: string | null
  tracked_time_total: number
  pomodoro_sessions_count: number
  recurring_rule: Record<string, unknown> | null
  is_archived: boolean
  assignee_ids: string[]
  checklist_items: Array<{
    id: string
    task_id: string
    text: string
    is_completed: boolean
    position: number
  }>
  created_at: string
  updated_at: string
}

/** Конвертирует ответ backend (snake_case) в frontend Task (camelCase) */
export function mapTask(r: TaskApiResponse): Task {
  return {
    id: r.id,
    boardId: r.board_id,
    columnId: r.column_id,
    title: r.title,
    description: r.description,
    status: r.status,
    priority: r.priority,
    position: r.position,
    dueDate: r.due_date,
    bgColor: r.bg_color,
    labels: [],
    checklists: [],
    assigneeIds: r.assignee_ids ?? [],
    totalTrackedSeconds: r.tracked_time_total,
    pomodoroSessionsCount: r.pomodoro_sessions_count,
    recurring: null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// ── request DTOs ──────────────────────────────────────────────────────────────

export interface CreateTaskRequest {
  boardId: string
  columnId: string
  title: string
  description?: string | null
  priority?: Priority
  dueDate?: string | null
  bgColor?: string | null
  assigneeIds?: string[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  dueDate?: string | null
  bgColor?: string | null
  assigneeIds?: string[]
}

export interface MoveTaskRequest {
  columnId: string
  position: number
}

// ── api ───────────────────────────────────────────────────────────────────────

export const tasksApi = {
  /** POST /tasks — создать задачу */
  createTask: (body: CreateTaskRequest): Promise<TaskApiResponse> =>
    apiClient.post<TaskApiResponse>('/tasks', {
      board_id: body.boardId,
      column_id: body.columnId,
      title: body.title,
      description: body.description ?? null,
      priority: body.priority,
      due_date: body.dueDate ?? null,
      bg_color: body.bgColor ?? null,
      assignee_ids: body.assigneeIds ?? [],
    }),

  /** PATCH /tasks/:taskId — частичное обновление задачи */
  updateTask: (taskId: string, body: UpdateTaskRequest): Promise<TaskApiResponse> =>
    apiClient.patch<TaskApiResponse>(`/tasks/${taskId}`, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      due_date: body.dueDate,
      bg_color: body.bgColor,
      assignee_ids: body.assigneeIds,
    }),

  /** DELETE /tasks/:taskId — удалить задачу */
  deleteTask: (taskId: string): Promise<void> =>
    apiClient.delete<void>(`/tasks/${taskId}`),

  /** PATCH /tasks/:taskId/move — переместить задачу в другую колонку */
  moveTask: (taskId: string, body: MoveTaskRequest): Promise<TaskApiResponse> =>
    apiClient.patch<TaskApiResponse>(`/tasks/${taskId}/move`, {
      column_id: body.columnId,
      position: body.position,
    }),
}
