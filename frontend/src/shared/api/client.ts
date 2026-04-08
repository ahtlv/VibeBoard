// Base URL — подставляется из env или дефолт для dev
const BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? 'http://localhost:8000/api/v1'

// ── error types ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network request failed')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

// ── response shape ────────────────────────────────────────────────────────────

interface ErrorBody {
  detail?: string
  code?: string
}

// ── token accessor ────────────────────────────────────────────────────────────
// Слабая ссылка на auth store — инжектируется через setTokenAccessor
// чтобы не создавать циклических зависимостей (api ← auth ← api)

let getAccessToken: (() => string | null) | null = null

export function setTokenAccessor(fn: () => string | null): void {
  getAccessToken = fn
}

// ── core request ──────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Override Authorization header (e.g. for refresh token call) */
  token?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const accessToken = token ?? getAccessToken?.()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    throw new NetworkError(cause)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json: unknown = await response.json().catch(() => ({}))

  if (!response.ok) {
    const err = json as ErrorBody
    throw new ApiError(
      response.status,
      err.code ?? String(response.status),
      err.detail ?? response.statusText,
    )
  }

  return json as T
}

// ── public API ────────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body, token }),

  put: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'PUT', body, token }),

  patch: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body, token }),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
}
