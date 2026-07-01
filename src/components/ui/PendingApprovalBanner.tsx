import { Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function PendingApprovalBanner() {
  const { user } = useAuth()

  if (!user || user.status !== 'pending') return null

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300/50 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/50">
        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <p className="font-semibold text-amber-800 dark:text-amber-300">
          Account Pending Approval
        </p>
        <p className="mt-0.5 text-sm text-amber-700/80 dark:text-amber-400/70">
          Your registration is under review by an administrator. You can explore the dashboard while you wait â€” full features will be unlocked once approved.
        </p>
      </div>
    </div>
  )
}
