import { ShieldAlert, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'

export default function PendingApprovalPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Account Under Review</h1>
        <p className="text-text-secondary mb-8">
          Welcome, {user?.name}! Your registration as an organization is currently pending administrator approval to ensure platform safety. We will notify you once your account has been verified.
        </p>
        
        <div className="space-y-3">
          <Button variant="primary" className="w-full" onClick={() => window.location.reload()}>
            Check Status Again
          </Button>
          <Button variant="secondary" className="w-full" icon={LogOut} onClick={logout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
