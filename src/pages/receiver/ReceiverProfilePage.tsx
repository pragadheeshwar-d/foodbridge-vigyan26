import { useState } from 'react'
import { ReceiverShell } from '../../components/receiver/ReceiverShell'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { EditProfileModal } from '../../components/donor/EditProfileModal'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useReceiverStats } from '../../hooks/useReceiverStats'
import { BadgeCheck, Mail, Phone, MapPin, Building2, Edit } from 'lucide-react'

export default function ReceiverProfilePage() {
  const { user } = useAuth()
  const { stats } = useReceiverStats()
  const [editOpen, setEditOpen] = useState(false)

  return (
    <ReceiverShell>
      <DashboardHeader
        title="Organization Profile"
        subtitle={`Profile for ${user?.organization || user?.name || 'your organization'}`}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mb-4 ring-4 ring-primary/20">
            {(user?.name || 'R').slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-text-secondary text-sm mt-1">{user?.organization || 'Recipient Organisation'}</p>

          <div className="flex items-center gap-1 mt-2">
            {user?.status === 'approved' ? (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <BadgeCheck className="w-4 h-4" /> Verified
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Pending Verification</span>
            )}
          </div>

          <Button variant="secondary" icon={Edit} className="mt-4 w-full" onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-text-secondary shrink-0" />
                <span>{user?.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-text-secondary shrink-0" />
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-text-secondary shrink-0" />
                <span>{user?.address || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-text-secondary shrink-0" />
                <span>{user?.organization || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Impact Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-primary/5">
                <p className="text-2xl font-bold text-primary">{stats.totalPickups}</p>
                <p className="text-xs text-text-secondary mt-1">Total Pickups</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary/5">
                <p className="text-2xl font-bold text-primary">{stats.totalMealsReceived}</p>
                <p className="text-xs text-text-secondary mt-1">Meals Received</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary/5">
                <p className="text-2xl font-bold text-primary">{stats.totalKgPrevented} kg</p>
                <p className="text-xs text-text-secondary mt-1">Waste Prevented</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary/5">
                <p className="text-2xl font-bold text-primary">{stats.co2Reduced} kg</p>
                <p className="text-xs text-text-secondary mt-1">CO₂ Reduced</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
    </ReceiverShell>
  )
}
