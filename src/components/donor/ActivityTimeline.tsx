import { UtensilsCrossed, Truck, CheckCircle, Heart } from 'lucide-react'
import { useDonorActivity } from '../../hooks/useDynamicContent'

const icons = {
  donation: UtensilsCrossed,
  pickup: Truck,
  success: CheckCircle,
  delivered: Heart,
}

const colors = {
  donation: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  pickup: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  delivered: 'bg-primary/10 text-primary',
}

export function ActivityTimeline() {
  const { activity: activityFeed } = useDonorActivity()

  if (activityFeed.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-text dark:text-white">Recent Activity</h3>
        <p className="text-sm text-text-secondary mt-4">No recent activity.</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text dark:text-white">Recent Activity</h3>
        <p className="text-sm text-text-secondary mt-1">
          Live updates from donations, volunteers, and NGO confirmations today.
        </p>
      </div>
      <div className="space-y-0">
        {activityFeed.map((item, i) => {
          const Icon = icons[item.type as keyof typeof icons] || UtensilsCrossed
          return (
            <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
              {i < activityFeed.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[item.type as keyof typeof colors] || colors.donation}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-semibold text-primary">{item.time}</p>
                <p className="text-sm font-semibold mt-0.5">{item.title}</p>
                <p className="text-xs text-text-secondary mt-1">{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
