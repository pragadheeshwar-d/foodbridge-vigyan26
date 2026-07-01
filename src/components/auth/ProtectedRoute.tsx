import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth, type UserRole } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
  requireApproved?: boolean
}

export function ProtectedRoute({ children, roles, requireApproved = true }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Loadingâ€¦
      </div>
    )
  }

  if (!user) {
    const preferredLogin =
      roles?.includes('receiver') && !roles?.includes('donor')
        ? '/auth/login/receiver'
        : '/auth/login/donor'

    return <Navigate to={`${preferredLogin}?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  // Block non-admins whose accounts are still pending or rejected.
  if (requireApproved && user.role !== 'admin' && user.role !== 'super_admin') {
    if (user.status === 'pending') {
      return <Navigate to="/pending" replace />
    }
    if (user.status === 'rejected') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Account rejected</h1>
            <p className="text-text-secondary mb-6">
              Your application was not approved. Please contact support if you believe this was a mistake.
            </p>
            <a href="/" className="text-primary font-medium hover:underline">
              Back to home
            </a>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}