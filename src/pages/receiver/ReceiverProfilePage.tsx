import { CheckCircle2, MapPin, Mail, Phone, Edit, Key, ShieldCheck, Star, Loader2 } from 'lucide-react'
import { ReceiverShell } from '../../components/receiver/ReceiverShell'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useReceiverStats } from '../../hooks/useReceiverStats'
import { EditProfileModal } from '../../components/donor/EditProfileModal'
import { useState } from 'react'

export default function ReceiverProfilePage() {
  const { user } = useAuth()
  const { stats, loading } = useReceiverStats()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    <ReceiverShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Organization Profile</h1>
        <p className="text-text-secondary">Manage your NGO details and settings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* --- Profile Card --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20" />

            {/* Avatar with initials fallback */}
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 z-10 shadow-md mt-6 bg-primary/10 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="NGO Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {(user?.organization || user?.name || 'RV').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <h2 className="font-bold text-xl mt-4 z-10">
              {user?.organization || 'Your Organization'}
            </h2>
            <div className="flex items-center gap-1 mt-1 z-10">
              {user?.status === 'approved' ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified NGO
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold rounded-full">
                  Pending Verification
                </span>
              )}
            </div>

            {user?.address && (
              <p className="text-text-secondary mt-4 flex items-center justify-center gap-2 text-sm">
                <MapPin className="w-4 h-4" /> {user.address}
              </p>
            )}

            <div className="w-full mt-6 space-y-3">
              <Button variant="primary" className="w-full" icon={Edit} onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
              <Button variant="secondary" className="w-full" icon={Key}>Change Password</Button>
            </div>
          </div>

          {/* --- Impact Statistics - from Firestore --- */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Impact Statistics</h3>
            {loading ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Meals Received',      value: stats.totalMealsReceived.toLocaleString() },
                  { label: 'Successful Pickups',  value: stats.totalPickups },
                  { label: 'Active Requests',     value: stats.activeRequests },
                  { label: 'Acceptance Rate',     value: `${stats.acceptanceRate}%` },
                  { label: 'Waste Prevented',     value: `${stats.totalKgPrevented} kg` },
                  { label: 'CO₂ Reduced',         value: `${stats.co2Reduced} kg` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Community Rating</span>
                  <span className="font-bold flex items-center gap-1 text-amber-500">
                    — <Star className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Detailed Info - from AuthContext (Firestore users collection) --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-text-secondary mb-1">Contact Person</p>
                <p className="font-medium flex items-center gap-2">
                  {user?.name || '—'}
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Email Address</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  {user?.email || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Phone Number</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-secondary" />
                  {user?.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Address</p>
                <p className="font-medium">{user?.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              Registration Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-text-secondary mb-1">Organization Name</p>
                <p className="font-medium">{user?.organization || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Account Status</p>
                <p className={`font-medium capitalize ${
                  user?.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                  user?.status === 'pending'  ? 'text-amber-600 dark:text-amber-400' :
                                                'text-red-600 dark:text-red-400'
                }`}>
                  {user?.status || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">User ID</p>
                <p className="font-medium font-mono text-xs">{user?.id || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Role</p>
                <p className="font-medium capitalize">{user?.role || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </ReceiverShell>
  )
}
