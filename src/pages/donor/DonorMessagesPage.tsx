import { DonorShell } from '../../components/donor/DonorShell'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { ChatInterface } from '../../components/donor/ChatInterface'

export default function DonorMessagesPage() {
  return (
    <DonorShell fab={false}>
      <DashboardHeader
        title="Messages"
        subtitle="Real-time coordination with NGOs and volunteers  share photos, locations, and pickup updates."
      />
      <ChatInterface />
    </DonorShell>
  )
}
