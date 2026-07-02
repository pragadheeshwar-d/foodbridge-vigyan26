import { type LucideIcon } from 'lucide-react'
import {
  UtensilsCrossed, Package, Truck, Leaf, Award, TrendingUp, Trophy,
} from 'lucide-react'
import { useDonationStats } from '../../hooks/useDonationStats'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  accent?: boolean
}

function MetricCard({ title, value, subtitle, icon: Icon, accent }: MetricCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${accent ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold mt-1 stat-value">{value}</p>
      <p className="text-xs text-text-secondary mt-2 leading-relaxed">{subtitle}</p>
    </div>
  )
}

function getCommunityRank(totalDonationEvents: number, totalMeals: number) {
  const score = totalDonationEvents * 2 + Math.floor(totalMeals / 25)

  if (score >= 120) return { value: 'Top 1%', subtitle: 'Elite community impact' }
  if (score >= 80) return { value: 'Top 3%', subtitle: 'Among the strongest donors' }
  if (score >= 50) return { value: 'Top 5%', subtitle: 'High-impact donor tier' }
  if (score >= 25) return { value: 'Top 10%', subtitle: 'Growing donor momentum' }
  if (score > 0) return { value: 'Rising', subtitle: 'Building community impact' }
  return { value: 'New', subtitle: 'Start your first donation' }
}

export function DashboardMetrics() {
  const { stats, loading } = useDonationStats()
  const communityRank = getCommunityRank(stats.totalDonationEvents, stats.totalMeals)

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-xl w-full mb-8" />
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Today's Donations"
        value={stats.todayDonations}
        subtitle="Recent activity"
        icon={UtensilsCrossed}
      />
      <MetricCard
        title="Meals Donated"
        value={stats.totalMeals}
        subtitle={`Helping approximately ${stats.totalMeals} people`}
        icon={Package}
      />
      <MetricCard
        title="Pending Pickups"
        value={stats.pendingPickups}
        subtitle={stats.pendingPickups > 0 ? "NGO arriving soon" : "No pending pickups"}
        icon={Truck}
      />
      <MetricCard
        title="Food Waste Prevented"
        value={`${stats.totalKg} kg`}
        subtitle="Rescued from landfill this month"
        icon={Leaf}
      />
      <MetricCard
        title="Monthly Impact Score"
        value={stats.totalMeals > 0 ? `94/100` : `0/100`}
        subtitle="Sustainability performance"
        icon={TrendingUp}
      />
      <MetricCard
        title="Community Rank"
        value={communityRank.value}
        subtitle={communityRank.subtitle}
        icon={Trophy}
        accent
      />
      <MetricCard
        title="Certificates Earned"
        value={stats.totalDonationEvents > 10 ? 1 : 0}
        subtitle="Download from Certificates page"
        icon={Award}
      />
    </div>
  )
}
