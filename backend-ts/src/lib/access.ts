import { getSupabase } from './supabase'

type Supabase = ReturnType<typeof getSupabase>

/** Проверяет членство юзера в воркспейсе доски. Возвращает workspace_id или null. */
export async function getBoardWorkspace(supabase: Supabase, boardId: string) {
  const { data } = await supabase
    .from('boards')
    .select('workspace_id')
    .eq('id', boardId)
    .single()
  return data?.workspace_id ?? null
}

export async function checkMembership(supabase: Supabase, workspaceId: string, userId: string) {
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()
  return data ?? null
}
