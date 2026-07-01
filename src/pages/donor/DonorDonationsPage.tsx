import { DonorShell } from '../../components/donor/DonorShell'
import { DonationsTable } from '../../components/donor/DonationsTable'
import { DashboardHeader } from '../../components/layout/DashboardLayout'

export default function DonorDonationsPage() {
  return (
    <DonorShell fab={false}>
      <DashboardHeader
        title="My Donations"
        subtitle="Manage all surplus food listings, track status, and coordinate with NGOs and volunteers."
      />
      <DonationsTable />
    </DonorShell>
  )
}
