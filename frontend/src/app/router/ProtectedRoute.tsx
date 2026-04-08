import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/store'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'idle') {
    // Auth state not yet resolved — render nothing while store initializes
    return null
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
