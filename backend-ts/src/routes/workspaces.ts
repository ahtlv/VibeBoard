import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../types'
import { authMiddleware } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

export const workspacesRouter = new Hono<AppEnv>()

workspacesRouter.use('*', authMiddleware)

// GET /api/v1/workspaces
workspacesRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const { data, error } = await supabase
    .from('workspace_members')
    .select('role, joined_at, workspaces(id, name, description, owner_id, created_at, updated_at)')
    .eq('user_id', userId)

  if (error) return c.json({ error: error.message }, 500)

  const workspaces = (data ?? []).map((row: any) => ({
    ...row.workspaces,
    role: row.role,
  }))

  return c.json(workspaces)
})

// POST /api/v1/workspaces
const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
})

workspacesRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const supabase = getSupabase(c.env)

  const body = await c.req.json().catch(() => null)
  const parsed = createWorkspaceSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: parsed.data.name, description: parsed.data.description, owner_id: userId })
    .select()
    .single()

  if (wsError || !workspace) return c.json({ error: wsError?.message ?? 'Failed to create workspace' }, 500)

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspace.id, user_id: userId, role: 'owner' })

  if (memberError) return c.json({ error: memberError.message }, 500)

  return c.json(workspace, 201)
})

// GET /api/v1/workspaces/:id/members
workspacesRouter.get('/:id/members', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.param('id')
  const supabase = getSupabase(c.env)

  // Проверяем что текущий юзер — участник
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()

  if (!membership) return c.json({ error: 'Not a member of this workspace' }, 403)

  const { data, error } = await supabase
    .from('workspace_members')
    .select('id, role, joined_at, users(id, email, name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('joined_at')

  if (error) return c.json({ error: error.message }, 500)

  const members = (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.users.id,
    name: row.users.name,
    email: row.users.email,
    avatar_url: row.users.avatar_url,
    role: row.role,
    joined_at: row.joined_at,
  }))

  return c.json(members)
})

// POST /api/v1/workspaces/:id/invite
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin']).default('member'),
})

workspacesRouter.post('/:id/invite', async (c) => {
  const userId = c.get('userId')
  const workspaceId = c.req.param('id')
  const supabase = getSupabase(c.env)

  // Проверяем права (только owner/admin)
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return c.json({ error: 'Only owner or admin can invite members' }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 422)

  const { email, role } = parsed.data

  // Проверяем — не является ли уже участником
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', existingUser.id)
      .single()

    if (existingMember) return c.json({ error: 'User is already a member of this workspace' }, 409)
  }

  // Проверяем — нет ли уже pending инвайта
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .single()

  if (existingInvite) return c.json({ error: 'A pending invitation for this email already exists' }, 409)

  // Генерируем токен и создаём инвайт (TTL 7 дней)
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      workspace_id: workspaceId,
      invited_by: userId,
      email: email.toLowerCase(),
      role,
      token,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error || !invitation) return c.json({ error: error?.message ?? 'Failed to create invitation' }, 500)

  const acceptUrl = `${c.env.FRONTEND_URL}/invitations/accept?token=${token}`
  console.log(`[DEV] Invite URL for ${email}: ${acceptUrl}`)

  return c.json(invitation, 201)
})
