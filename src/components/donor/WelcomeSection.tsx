import { ShieldCheck, Clock, AlertCircle } from 'lucide-react'
function formatLiveDateTime() {
  return new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDonationStats } from '../../hooks/useDonationStats'

export function WelcomeSection() {
  const [dateTime, setDateTime] = useState(formatLiveDateTime())
  const { user } = useAuth()
  const { stats } = useDonationStats()

  useEffect(() => {
    const t = setInterval(() => setDateTime(formatLiveDateTime()), 60000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-text-secondary mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {dateTime}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Donor'} 
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.status === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold border border-green-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
              </span>
            ) : user?.status === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" /> Pending Approval
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5" /> Unverified
              </span>
            )}
          </div>
        </div>

        <p className="text-text-secondary leading-relaxed max-w-3xl">
          Your organization ({user?.organization || 'Food Bridge Partner'}) has donated{' '}
          <strong className="text-text dark:text-white">{stats.mealsDonatedThisMonth} meals</strong> this month,
          helping <strong className="text-text dark:text-white">NGOs</strong> across Chennai.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold text-primary">{stats.pendingPickups}</p>
            <p className="text-xs text-text-secondary mt-1">Pending Pickups</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold text-accent">{stats.totalDonationEvents}</p>
            <p className="text-xs text-text-secondary mt-1">Total Donations Made</p>
          </div>
          {stats.expiringSoon > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {stats.expiringSoon} donation(s) expiring in next 2 hours
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">Please prepare for pickup soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

