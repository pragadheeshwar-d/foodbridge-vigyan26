import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { DonorShell } from '../../components/donor/DonorShell'
import { WelcomeSection } from '../../components/donor/WelcomeSection'
import { DashboardMetrics } from '../../components/donor/DashboardMetrics'
import { Button } from '../../components/ui/Button'
import { PendingApprovalBanner } from '../../components/ui/PendingApprovalBanner'

export default function DonorDashboard() {
  return (
    <DonorShell>
      <PendingApprovalBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 mb-6 -mt-2">
        <Link to="/donor/add">
          <Button variant="primary" icon={Plus}>Add Donation</Button>
        </Link>
      </div>

      <WelcomeSection />
      <DashboardMetrics />
    </DonorShell>
  )
}
