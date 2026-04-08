import { apiClient } from './client'
import type { Board, Column } from '@/entities/board/types'

// ── request DTOs ──────────────────────────────────────────────────────────────

export interface CreateBoardRequest {
  workspaceId: string
  title: string
  description?: string
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

// ── api ───────────────────────────────────────────────────────────────────────

export const boardsApi = {
  /** GET /workspaces/:workspaceId/boards — список досок workspace */
  listBoards: (workspaceId: string): Promise<BoardSummary[]> =>
    apiClient.get<BoardSummary[]>(`/workspaces/${workspaceId}/boards`),

  /** GET /boards/:boardId — полная доска с колонками и задачами */
  getBoard: (boardId: string): Promise<Board> =>
    apiClient.get<Board>(`/boards/${boardId}`),

  /** POST /workspaces/:workspaceId/boards — создать доску */
  createBoard: (body: CreateBoardRequest): Promise<Board> =>
    apiClient.post<Board>(`/workspaces/${body.workspaceId}/boards`, {
      title: body.title,
      description: body.description,
    }),

  /** POST /boards/:boardId/columns — добавить колонку */
  createColumn: (boardId: string, body: CreateColumnRequest): Promise<Column> =>
    apiClient.post<Column>(`/boards/${boardId}/columns`, body),

  /** DELETE /boards/:boardId — удалить доску */
  deleteBoard: (boardId: string): Promise<void> =>
    apiClient.delete<void>(`/boards/${boardId}`),
}
