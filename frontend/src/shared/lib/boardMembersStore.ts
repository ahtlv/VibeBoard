import type { BoardMember } from '@/entities/board/types'

// Временный in-memory store для предзаполнения участников борда при создании.
// DashboardPage читает при первой загрузке борда и очищает запись.
// Заменится на реальный API-вызов когда backend будет готов.

const store = new Map<string, BoardMember[]>()

export const boardMembersStore = {
  set: (boardId: string, members: BoardMember[]) => store.set(boardId, members),
  consume: (boardId: string): BoardMember[] | null => {
    const members = store.get(boardId) ?? null
    store.delete(boardId)
    return members
  },
}
