import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Mail, Phone, Building2, MapPin, Loader2 } from 'lucide-react'
import { DashboardLayout, DashboardHeader, TopBar } from '../../components/layout/DashboardLayout'
import { StatCard } from '../../components/ui/StatCard'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { NotificationBell } from '../../components/ui/SharedComponents'
import { TopDonorsChart, CityHeatmapChart, PieDistributionChart } from '../../components/charts/Charts'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../context/AuthContext'

interface AdminUserRecord {
  id: string
  name: string
  email: string
  phone?: string
  organization?: string
  address?: string
  role: UserRole
  status: 'pending' | 'approved' | 'rejected'
  businessType?: string
  verificationId?: string
  createdAt?: Date
}

const navItems = [
  { label: 'Overview', path: '/admin', icon: () => <span> </span> },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filter !== 'all') params.status = filter
      const res = await api.get('/services/admin/users', { params })
      const items: AdminUserRecord[] = (res.data || []).map((u: any) => ({
        id: String(u.id),
        name: u.name || 'Unnamed',
        email: u.email || '',
        phone: u.phone,
        organization: u.organization,
        address: u.address,
        role: u.role || 'donor',
        status: u.status || (u.verified ? 'approved' : 'pending'),
        businessType: u.business_type,
        verificationId: u.verification_id,
        createdAt: u.created_at ? new Date(u.created_at) : undefined,
      }))
      setUsers(items)
    } catch (err) {
      console.error('Admin user fetch failed', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleApprove = async (id: string) => {
    setBusyId(id)
    try {
      await api.put(`/services/admin/users/${id}`, { verified: true, status: 'approved' })
      toast('User approved', 'success')
      fetchUsers()
    } catch (err) {
      console.error('Approve failed', err)
      toast('Failed to approve user', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id: string) => {
    setBusyId(id)
    try {
      await api.put(`/services/admin/users/${id}`, { verified: false, status: 'rejected' })
      toast('User rejected', 'info')
      fetchUsers()
    } catch (err) {
      console.error('Reject failed', err)
      toast('Failed to reject user', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const totals = {
    pending: users.length,
    donors: users.filter((u) => u.role === 'donor').length,
    receivers: users.filter((u) => u.role === 'receiver').length,
  }

  return (
    <DashboardLayout navItems={navItems} role="admin">
      <TopBar
        search={<Input placeholder="Search users..." icon />}
        extra={<NotificationBell />}
        profile={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-xs text-text-secondary">Super Admin</p>
            </div>
          </div>
        }
      />

      <DashboardHeader
        title="Admin Overview"
        subtitle="Verify organizations and monitor platform health"
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard title="Pending verifications" value={totals.pending} icon={CheckCircle2} color="text-amber-500" />
        <StatCard title="Donors onboarded" value={totals.donors} icon={Building2} />
        <StatCard title="Receivers onboarded" value={totals.receivers} icon={Building2} color="text-blue-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <TopDonorsChart
          data={[
            { name: 'Top Donor A', meals: 0 },
          ]}
        />
        <CityHeatmapChart
          data={[
            { city: 'Chennai', donations: 0 },
          ]}
        />
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold">Verification queue</h3>
            <p className="text-sm text-text-secondary">Review pending organizations and approve them to unlock the platform.</p>
          </div>
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? 'primary' : 'secondary'}
                onClick={() => setFilter(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-secondary">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p>Loading {filter} users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {filter === 'all' ? '' : filter} users right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{u.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase tracking-wide">
                      {u.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : u.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                  {u.organization && (
                    <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5" /> {u.organization}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-2">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                    {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                    {u.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {u.address}</span>}
                    {u.verificationId && <span className="font-mono">Reg: {u.verificationId}</span>}
                    {u.businessType && <span>Type: {u.businessType}</span>}
                  </div>
                </div>
                {u.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={busyId === u.id}
                      icon={CheckCircle2}
                      onClick={() => handleApprove(u.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={busyId === u.id}
                      icon={XCircle}
                      onClick={() => handleReject(u.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <PieDistributionChart
          data={[
            { name: 'Donors', value: totals.donors || 1 },
            { name: 'Receivers', value: totals.receivers || 1 },
          ]}
        />
      </div>
    </DashboardLayout>
  )
}