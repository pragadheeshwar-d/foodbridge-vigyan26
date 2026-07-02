import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DonorShell } from '../../components/donor/DonorShell'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/SharedComponents'
import { Truck, Loader2 } from 'lucide-react'
import { useDonorPickups } from '../../hooks/useDonationStats'
import { donorApprovesPickup, donorDeclinesPickup } from '../../services/pickupRequestService'
import { useToast } from '../../context/ToastContext'

export default function DonorPickupsPage() {
  const { pickups, loading } = useDonorPickups()
  const { toast } = useToast()
  const [busyId, setBusyId] = useState<string | null>(null)
  const hasRequests = pickups.length > 0

  const handleApprove = async (id: string) => {
    setBusyId(id)
    try {
      await donorApprovesPickup(id)
      toast('Pickup approved', 'success')
    } catch (err) {
      console.error('Approve failed', err)
      toast('Failed to approve pickup', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleDecline = async (id: string, donationId?: string) => {
    setBusyId(id)
    try {
      await donorDeclinesPickup(id, donationId)
      toast('Pickup declined', 'info')
    } catch (err) {
      console.error('Decline failed', err)
      toast('Failed to decline pickup', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DonorShell>
      <DashboardHeader
        title="Pickup Requests"
        subtitle="Review NGO pickup requests, approve them, and monitor collection schedules."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading pickup requests...</p>
        </div>
      ) : hasRequests ? (
        <div className="space-y-4">
          {pickups.map((p) => (
            <div key={p.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{p.food}</p>
                <p className="text-sm text-text-secondary mt-1">{p.ngo}  Pickup at {p.time}</p>
                <p className="text-xs font-mono text-text-secondary mt-1">{String(p.id).slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                {p.status === 'pending' && (
                  <>
                    <Button variant="primary" size="sm" loading={busyId === p.id} onClick={() => handleApprove(p.id)}>
                      Approve
                    </Button>
                    <Button variant="secondary" size="sm" loading={busyId === p.id} onClick={() => handleDecline(p.id, p.donationId)}>
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Truck}
          title="No pickup requests available"
          description="Everything is up to date. New NGO requests will appear here when they match your donations."
          action={<Link to="/donor/add"><Button variant="primary">Create Donation</Button></Link>}
        />
      )}
    </DonorShell>
  )
}
