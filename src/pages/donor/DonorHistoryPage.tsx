import { DonorShell } from '../../components/donor/DonorShell'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { useDonorHistory } from '../../hooks/useDynamicContent'
import { StatusBadge } from '../../components/ui/Badge'

export default function DonorHistoryPage() {
  const { history: completed } = useDonorHistory()

  return (
    <DonorShell fab={false}>
      <DashboardHeader
        title="Donation History"
        subtitle="Complete archive of verified donations, deliveries, and NGO confirmations."
      />
      <div className="space-y-3">
        {completed.map((d) => (
          <div key={d.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl">📦</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{d.foodType}</p>
              <p className="text-sm text-text-secondary">{d.receiverName}  {d.meals} meals  {d.completedAt.toLocaleDateString()}</p>
              <p className="text-xs font-mono text-text-secondary mt-1">{d.id}</p>
            </div>
            <StatusBadge status={d.status} />
          </div>
        ))}
      </div>
    </DonorShell>
  )
}
