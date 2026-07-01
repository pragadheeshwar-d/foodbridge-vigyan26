import { useState } from 'react'
import { MapPin, QrCode, CheckCircle, Navigation, Loader2 } from 'lucide-react'
import { ReceiverShell } from '../../components/receiver/ReceiverShell'
import { Button } from '../../components/ui/Button'
import { useReceiverRequests } from '../../hooks/useReceiverStats'
import { useToast } from '../../context/ToastContext'
import { markPickupCompleted } from '../../services/pickupRequestService'

export default function ReceiverSchedulePage() {
  const { toast } = useToast()
  const { requests, loading } = useReceiverRequests()
  const [busyId, setBusyId] = useState<string | null>(null)

  const scheduled = requests.filter(r => r.status === 'accepted')

  const handleCollected = async (id: string, donationId: string) => {
    setBusyId(id)
    try {
      await markPickupCompleted(id, donationId)
      toast('Marked as collected.', 'success')
    } catch (err) {
      console.error('Mark collected failed', err)
      toast('Failed to update pickup', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <ReceiverShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Pickup Schedule</h1>
        <p className="text-text-secondary">Manage your upcoming food pickups.</p>
      </div>

      {loading ? (
        <div className="glass-card p-16 flex items-center justify-center gap-3 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading schedule…</span>
        </div>
      ) : scheduled.length === 0 ? (
        <div className="glass-card p-16 text-center text-text-secondary">
          <QrCode className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">No pickups scheduled</p>
          <p className="text-sm mt-1">Once your requests are approved, they will appear here.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {scheduled.map((pickup) => (
            <div key={pickup.id} className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{pickup.donorName}</h3>
                  <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {pickup.pickupAddress || 'Address on file'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-lg border border-primary/20">
                  {pickup.pickupTime}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Food Item</span>
                  <span className="font-medium">{pickup.foodType}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Quantity</span>
                  <span className="font-medium">{pickup.quantity} {pickup.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Pickup Address</span>
                  <span className="font-medium text-right max-w-[180px] truncate">
                    {pickup.pickupAddress || '—'}
                  </span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="secondary" className="w-full flex justify-center" icon={Navigation}>
                  Maps
                </Button>
                <Button variant="secondary" className="w-full flex justify-center" icon={QrCode}>
                  QR Verify
                </Button>
                <Button
                  variant="primary"
                  className="w-full flex justify-center"
                  icon={CheckCircle}
                  loading={busyId === pickup.id}
                  onClick={() => handleCollected(pickup.id, pickup.donationId)}
                >
                  Collected
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ReceiverShell>
  )
}