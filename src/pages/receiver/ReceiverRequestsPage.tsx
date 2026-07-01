import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ReceiverShell } from '../../components/receiver/ReceiverShell'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useReceiverRequests } from '../../hooks/useReceiverStats'

type Tab = 'pending' | 'accepted' | 'completed' | 'declined'

export default function ReceiverRequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const { requests, loading } = useReceiverRequests()

  const filtered = requests.filter(r => r.status === activeTab)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pending',   label: 'Pending' },
    { id: 'accepted',  label: 'Approved' },
    { id: 'completed', label: 'Completed' },
    { id: 'declined',  label: 'Declined' },
  ]

  return (
    <ReceiverShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Requests</h1>
        <p className="text-text-secondary">Track and manage your pickup requests.</p>
      </div>

      <div className="glass-card mb-6 p-1 inline-flex overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 shadow-sm text-primary'
                : 'text-text-secondary hover:text-text hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
            {/* live count badge */}
            {!loading && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-semibold">
                {requests.filter(r => r.status === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading requests...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-text-secondary">
                <th className="p-4 font-semibold">Donor / Restaurant</th>
                <th className="p-4 font-semibold">Food</th>
                <th className="p-4 font-semibold">Quantity</th>
                <th className="p-4 font-semibold">Pickup Time</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr key={req.id}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-medium">{req.donorName}</td>
                    <td className="p-4">{req.foodType}</td>
                    <td className="p-4">{req.quantity} {req.unit}</td>
                    <td className="p-4 text-text-secondary">{req.pickupTime}</td>
                    <td className="p-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-secondary">
                    No {activeTab} requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </ReceiverShell>
  )
}
