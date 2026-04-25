import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginPage } from '../index'

// ── mocks ─────────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}))

vi.mock('@/features/auth/store', () => ({
  useAuth: () => ({ setAuth: vi.fn() }),
}))

vi.mock('@/shared/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Sonner toast — не нужен в DOM-тестах
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

vi.mock('@/shared/ui/ThemeToggle', () => ({
  ThemeToggle: () => null,
}))

// ── helpers ───────────────────────────────────────────────────────────────────

function renderLoginPage() {
  return render(<LoginPage />)
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('render', () => {
    it('shows email and password inputs', () => {
      renderLoginPage()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('shows sign in button', () => {
      renderLoginPage()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows link to register page', () => {
      renderLoginPage()
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows error when submitting with empty email', async () => {
      renderLoginPage()
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    it('shows error when submitting with empty password', async () => {
      renderLoginPage()
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    it('shows error for invalid email format', async () => {
      renderLoginPage()
      await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })

    it('clears email error when user starts typing', async () => {
      renderLoginPage()
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()

      await userEvent.type(screen.getByLabelText(/email/i), 'a')
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
    })
  })
})
