import { apiClient } from './client'
import type { User } from '@/entities/user/types'

// ── request DTOs ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RefreshRequest {
  refresh_token: string
}

// ── response DTOs ─────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string
  token_type: 'bearer'
  expires_in: number
}

export interface LoginResponse extends AuthTokens {
  user: User
}

export interface RegisterResponse extends AuthTokens {
  user: User
}

export interface RegisterPendingResponse {
  email: string
  email_verification_required: boolean
  message: string
  dev_verification_url: string | null
}

export interface VerifyEmailResponse extends AuthTokens {
  user: User
}

// ── api ───────────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /auth/login — email + password → tokens + user */
  login: (body: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/login', body),

  /** POST /auth/register — новый аккаунт → tokens + user */
  register: (body: RegisterRequest): Promise<RegisterPendingResponse> =>
    apiClient.post<RegisterPendingResponse>('/auth/register', body),

  /** GET /auth/verify-email — подтвердить email по одноразовому токену */
  verifyEmail: (token: string): Promise<VerifyEmailResponse> =>
    apiClient.get<VerifyEmailResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  /** GET /auth/me — текущий пользователь по access token */
  getMe: (): Promise<User> =>
    apiClient.get<User>('/auth/me'),

  /** POST /auth/refresh — обменять refresh token на новый access token */
  refreshToken: (body: RefreshRequest): Promise<AuthTokens> =>
    apiClient.post<AuthTokens>('/auth/refresh', body),

  /** POST /auth/logout — инвалидировать refresh token на сервере */
  logout: (): Promise<void> =>
    apiClient.post<void>('/auth/logout'),
}
