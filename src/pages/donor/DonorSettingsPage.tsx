import { DonorShell } from '../../components/donor/DonorShell'
import { DashboardHeader } from '../../components/layout/DashboardLayout'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

export default function DonorSettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  return (
    <DonorShell fab={false}>
      <DashboardHeader
        title="Settings"
        subtitle={`Manage notifications, pickup preferences, and account security for ${user?.organization || user?.name}.`}
      />

      <div className="max-w-2xl space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold">Organization Details</h3>
          <Input label="Organization Name" defaultValue={user?.organization || ''} />
          <Input label="Contact Person" defaultValue={user?.name || ''} />
          <Input label="Email" type="email" defaultValue={user?.email || ''} />
          <Input label="Phone" defaultValue="" />
          <Input label="Pickup Address" defaultValue="" />
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold">Notification Preferences</h3>
          <Select label="Email Alerts" options={[
            { value: 'all', label: 'All activity' },
            { value: 'important', label: 'Important only' },
            { value: 'none', label: 'None' },
          ]} />
          <Select label="Pickup Reminders" options={[
            { value: '30', label: '30 minutes before' },
            { value: '60', label: '1 hour before' },
            { value: '120', label: '2 hours before' },
          ]} />
        </div>

        <Button variant="primary" onClick={() => toast('Settings saved successfully', 'success')}>
          Save Changes
        </Button>
      </div>
    </DonorShell>
  )
}
