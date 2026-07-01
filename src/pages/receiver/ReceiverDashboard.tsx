import {
  PackageSearch, ListOrdered, CalendarDays, CheckCircle2, Leaf, Wind
} from 'lucide-react'
import { ReceiverShell } from '../../components/receiver/ReceiverShell'
import { StatCard } from '../../components/ui/StatCard'
import { useReceiverStats } from '../../hooks/useReceiverStats'
import { ReceiverWelcomeSection } from '../../components/receiver/ReceiverWelcomeSection'

export default function ReceiverDashboard() {
  // Live Firestore data
  const { stats, loading: statsLoading } = useReceiverStats()

  return (
    <ReceiverShell>
      <ReceiverWelcomeSection />

      {/* Overview Cards (all from Firestore) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Available Donations"
          value={statsLoading ? '—' : stats.availableDonations}
          icon={PackageSearch}
        />
        <StatCard
          title="Active Requests"
          value={statsLoading ? '—' : stats.activeRequests}
          icon={ListOrdered}
        />
        <StatCard
          title="Today's Pickups"
          value={statsLoading ? '—' : stats.todayPickups}
          icon={CalendarDays}
        />
        <StatCard
          title="Meals Received"
          value={statsLoading ? '—' : stats.totalMealsReceived.toLocaleString()}
          icon={CheckCircle2}
        />
        <StatCard
          title="Waste Prevented"
          value={statsLoading ? '—' : `${stats.totalKgPrevented} kg`}
          icon={Leaf}
          color="text-accent"
        />
        <StatCard
          title="CO₂ Reduced"
          value={statsLoading ? '—' : `${stats.co2Reduced} kg`}
          icon={Wind}
          color="text-blue-500"
        />
      </div>
    </ReceiverShell>
  )
}
