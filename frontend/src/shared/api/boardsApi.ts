import { apiClient } from './client'
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

// ── api ───────────────────────────────────────────────────────────────────────

export const boardsApi = {
  /** GET /boards?workspace_id= — список досок workspace */
  listBoards: (workspaceId: string): Promise<BoardSummary[]> =>
    apiClient.get<BoardSummary[]>(`/boards?workspace_id=${workspaceId}`),

  /** POST /boards — создать доску */
  createBoard: (body: CreateBoardRequest): Promise<Board> =>
    apiClient.post<Board>('/boards', {
      workspace_id: body.workspaceId,
      title: body.title,
      description: body.description,
    }),

  /** POST /columns — добавить колонку */
  createColumn: (boardId: string, body: CreateColumnRequest): Promise<Column> =>
    apiClient.post<Column>('/columns', { board_id: boardId, title: body.title }),

  /** PATCH /boards/:boardId — обновить доску */
  updateBoard: (boardId: string, body: UpdateBoardRequest): Promise<BoardSummary> =>
    apiClient.patch<BoardSummary>(`/boards/${boardId}`, body),

  /** DELETE /boards/:boardId — архивировать доску */
  deleteBoard: (boardId: string): Promise<void> =>
    apiClient.delete<void>(`/boards/${boardId}`),
}
