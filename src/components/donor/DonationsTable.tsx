import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Loader2 } from 'lucide-react'
import { StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useDonorDonations } from '../../hooks/useDonationStats'

interface DonationsTableProps {
  compact?: boolean
  limit?: number
}

export function DonationsTable({ compact = false, limit }: DonationsTableProps) {
  const { donations, loading } = useDonorDonations()
  const rows = limit ? donations.slice(0, limit) : donations

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text dark:text-white">Recent Donations</h3>
          {!compact && (
            <p className="text-sm text-text-secondary mt-0.5">
              Full donation lifecycle with receivers and expiry tracking.
            </p>
          )}
        </div>
        {compact && (
          <Link to="/donor/donations" className="text-sm text-primary font-medium hover:underline">View all</Link>
        )}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-3 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading donations...
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <p>No donations found.</p>
            {compact && <p className="text-sm mt-1">Add a new donation to see it here.</p>}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-text-secondary border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Food</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Meals</th>
                <th className="pb-3 font-medium">Receiver</th>
                <th className="pb-3 font-medium">Pickup</th>
                <th className="pb-3 font-medium">Expiry</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 font-mono text-xs">{d.id.slice(0, 8)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={d.image} alt={d.food} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium">{d.food}</span>
                    </div>
                  </td>
                  <td className="py-3 text-text-secondary">{d.category}</td>
                  <td className="py-3">{d.meals}</td>
                  <td className="py-3 text-text-secondary max-w-[140px] truncate">{d.receiver}</td>
                  <td className="py-3">{d.pickupTime}</td>
                  <td className="py-3">{d.expiryTime}</td>
                  <td className="py-3"><StatusBadge status={d.status} /></td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="View details">
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="More actions">
                        <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!compact && rows.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Link to="/donor/donations"><Button variant="secondary" size="sm">Manage all donations</Button></Link>
        </div>
      )}
    </div>
  )
}
