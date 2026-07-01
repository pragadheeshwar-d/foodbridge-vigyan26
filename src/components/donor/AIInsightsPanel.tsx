import { Link } from 'react-router-dom'
import { Brain, Clock, MapPin, TrendingUp } from 'lucide-react'
import { useDonorInsights } from '../../hooks/useDynamicContent'

const icons = { clock: Clock, map: MapPin, trend: TrendingUp }

export function AIInsightsPanel() {
  const { insight } = useDonorInsights()

  const insightsList = insight ? [
    { icon: 'clock', title: 'Peak Window', message: 'Analyzing pickup patterns.', recommendation: insight.peakWindow },
    { icon: 'trend', title: 'Action Needed', message: 'Current status check.', recommendation: insight.recommendation }
  ] : []

  return (
    <div className="glass-card p-6 border border-primary/10">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text dark:text-white">Smart AI Insights</h3>
          <p className="text-xs text-text-secondary">Personalized recommendations for ITC Grand Chola</p>
        </div>
      </div>
      <div className="space-y-4">
        {insightsList.map((item, i) => {
          const Icon = icons[item.icon as keyof typeof icons] || Clock
          return (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{item.message}</p>
                  <p className="text-xs font-medium text-primary mt-2">{item.recommendation}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Link to="/donor/analytics" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
        View full analytics  â€™
      </Link>
    </div>
  )
}
