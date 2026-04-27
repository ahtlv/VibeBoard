import { apiClient } from './client'
import { mapTask, type TaskApiResponse } from './tasksApi'
import type { Board, Column } from '@/entities/board/types'

// ── request DTOs ──────────────────────────────────────────────────────────────

export interface CreateBoardRequest {
  workspaceId: string
  title: string
  description?: string
}

export interface UpdateBoardRequest {
  title?: string
  description?: string | null
}

export interface CreateColumnRequest {
  title: string
}

// ── response DTOs ─────────────────────────────────────────────────────────────

export interface BoardSummary {
  id: string
  workspaceId: string
  title: string
  description: string | null
  columnCount: number
  taskCount: number
  createdAt: string
  updatedAt: string
}

interface ColumnApiResponse {
  id: string
  board_id: string
  title: string
  position: number
  tasks: TaskApiResponse[]
}

interface BoardDetailApiResponse {
  id: string
  workspace_id: string
  title: string
  description: string | null
  columns: ColumnApiResponse[]
  created_at: string
  updated_at: string
}

// snake_case → BoardSummary (для listBoards)
function mapBoardSummary(r: Record<string, unknown>): BoardSummary {
  return {
    id: r.id as string,
    workspaceId: (r.workspace_id ?? r.workspaceId) as string,
    title: r.title as string,
    description: (r.description ?? null) as string | null,
    columnCount: (r.column_count ?? 0) as number,
    taskCount: (r.task_count ?? 0) as number,
    createdAt: (r.created_at ?? r.createdAt) as string,
    updatedAt: (r.updated_at ?? r.updatedAt) as string,
  }
}

function mapBoardDetail(r: BoardDetailApiResponse): Board {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    title: r.title,
    description: r.description,
    labels: [],
    columns: r.columns.map((col): Column => ({
      id: col.id,
      boardId: col.board_id,
      title: col.title,
      position: col.position,
      tasks: col.tasks.map(mapTask),
    })),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// ── api ───────────────────────────────────────────────────────────────────────

export const boardsApi = {
  /** GET /boards?workspace_id= — список досок workspace */
  listBoards: (workspaceId: string): Promise<BoardSummary[]> =>
    apiClient
      .get<Record<string, unknown>[]>(`/boards?workspace_id=${workspaceId}`)
      .then((list) => list.map(mapBoardSummary)),

  /** GET /boards/:id — полная доска с колонками и задачами */
  getBoard: (boardId: string): Promise<Board> =>
    apiClient
      .get<BoardDetailApiResponse>(`/boards/${boardId}`)
      .then(mapBoardDetail),

  /** POST /boards — создать доску */
  createBoard: (body: CreateBoardRequest): Promise<BoardSummary> =>
    apiClient
      .post<Record<string, unknown>>('/boards', {
        workspace_id: body.workspaceId,
        title: body.title,
        description: body.description,
      })
      .then(mapBoardSummary),

  /** POST /columns — добавить колонку */
  createColumn: (boardId: string, body: CreateColumnRequest): Promise<Column> =>
    apiClient.post<Column>('/columns', { board_id: boardId, title: body.title }),

  /** PATCH /boards/:boardId — обновить доску */
  updateBoard: (boardId: string, body: UpdateBoardRequest): Promise<BoardSummary> =>
    apiClient
      .patch<Record<string, unknown>>(`/boards/${boardId}`, body)
      .then(mapBoardSummary),

  /** DELETE /boards/:boardId — архивировать доску */
  deleteBoard: (boardId: string): Promise<void> =>
    apiClient.delete<void>(`/boards/${boardId}`),
}
