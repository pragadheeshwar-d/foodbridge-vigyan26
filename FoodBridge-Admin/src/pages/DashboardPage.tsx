import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  Users, CheckCircle, XCircle, Clock, Package,
  LogOut, Shield, Search, RefreshCw
} from 'lucide-react'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  organization?: string
  status: string
  createdAt?: string
}

interface DonationRecord {
  id: string
  donorName: string
  foodType: string
  quantity: number
  status: string
  createdAt?: { seconds: number }
}

export default function DashboardPage() {
  const { admin, logout } = useAdminAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'donations'>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const usersSnap = await getDocs(collection(db, 'users'))
      const usersData: UserRecord[] = []
      usersSnap.forEach(d => {
        const data = d.data()
        if (data.role !== 'admin' && data.role !== 'super_admin') {
          usersData.push({ id: d.id, ...data } as UserRecord)
        }
      })
      setUsers(usersData)

      const donationsSnap = await getDocs(collection(db, 'donations'))
      const donationsData: DonationRecord[] = []
      donationsSnap.forEach(d => donationsData.push({ id: d.id, ...d.data() } as DonationRecord))
      setDonations(donationsData)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { status })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
      showToast(`User ${status} successfully!`)
    } catch {
      showToast('Failed to update status', 'error')
    }
    setUpdatingId(null)
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchStatus
  })

  // Stats
  const pending = users.filter(u => u.status === 'pending').length
  const approved = users.filter(u => u.status === 'approved').length
  const rejected = users.filter(u => u.status === 'rejected').length
  const totalDonations = donations.length

  const statCards = [
    { label: 'Pending Approvals', value: pending, color: '#f59e0b', icon: Clock },
    { label: 'Approved Users', value: approved, color: '#10b981', icon: CheckCircle },
    { label: 'Rejected Users', value: rejected, color: '#ef4444', icon: XCircle },
    { label: 'Total Donations', value: totalDonations, color: '#6366f1', icon: Package },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
          color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.2s ease'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 14 }}>FoodBridge</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'donations', label: 'Donations', icon: Package },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as 'users' | 'donations')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, border: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600,
                background: activeTab === item.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activeTab === item.id ? 'var(--primary-light)' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}>
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Signed in as</p>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{admin?.name}</p>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              {activeTab === 'users' ? 'User Management' : 'Donations Overview'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>
              {activeTab === 'users' ? 'Approve or reject new registrations' : 'All donations from registered donors'}
            </p>
          </div>
          <button onClick={fetchData} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {statCards.map(card => (
            <div key={card.label} className="glass" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={18} color={card.color} />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{loading ? '–' : card.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── USER MANAGEMENT ── */}
        {activeTab === 'users' && (
          <div className="glass" style={{ overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  placeholder="Search by name, email or organization..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    borderRadius: 9, color: 'var(--text)', fontSize: 13, fontFamily: 'Inter',
                    outline: 'none'
                  }}
                />
              </div>
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name & Organization', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                  ) : filteredUsers.map((user, i) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: '#fff'
                          }}>
                            {user.name?.slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</p>
                            {user.organization && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.organization}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{user.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge badge-${user.role === 'donor' ? 'donor' : 'receiver'}`}>{user.role}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge badge-${user.status || 'pending'}`}>{user.status || 'pending'}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {user.status !== 'approved' && (
                            <button onClick={() => updateUserStatus(user.id, 'approved')} disabled={updatingId === user.id}
                              className="btn btn-success btn-sm" style={{ opacity: updatingId === user.id ? 0.6 : 1 }}>
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}
                          {user.status !== 'rejected' && (
                            <button onClick={() => updateUserStatus(user.id, 'rejected')} disabled={updatingId === user.id}
                              className="btn btn-danger btn-sm" style={{ opacity: updatingId === user.id ? 0.6 : 1 }}>
                              <XCircle size={13} /> Reject
                            </button>
                          )}
                          {user.status === 'approved' && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Approved ✓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DONATIONS TAB ── */}
        {activeTab === 'donations' && (
          <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Donor', 'Food Type', 'Quantity', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                  ) : donations.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No donations found.</td></tr>
                  ) : donations.map((don, i) => (
                    <tr key={don.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600 }}>{don.donorName}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{don.foodType}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13 }}>{don.quantity} meals</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge badge-${don.status === 'pending' ? 'pending' : don.status === 'completed' ? 'approved' : 'pending'}`}>{don.status}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {don.createdAt ? new Date(don.createdAt.seconds * 1000).toLocaleDateString('en-IN') : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
