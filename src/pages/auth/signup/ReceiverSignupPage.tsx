import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, MapPin, Phone, UserRound, BadgeCheck, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { AuthShell } from '../AuthShell'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

export function ReceiverSignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    orgName: '',
    verificationId: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    operatingHours: '',
  })

  const submit = async () => {
    const nextErrors: Record<string, string> = {}
    if (!form.orgName) nextErrors.orgName = 'Organization name is required.'
    if (!form.verificationId) nextErrors.verificationId = 'Verification ID is required for receivers.'
    if (!form.contactPerson) nextErrors.contactPerson = 'Contact person is required.'
    if (!form.email) nextErrors.email = 'Email is required.'
    if (!form.phone) nextErrors.phone = 'Phone number is required.'
    if (!form.password || form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!form.address) nextErrors.address = 'Pickup / delivery address is required.'
    if (!form.operatingHours) nextErrors.operatingHours = 'Operating hours are required.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await register({
        name: form.contactPerson,
        organization: form.orgName,
        email: form.email,
        password: form.password,
        role: 'receiver',
        phone: form.phone,
        address: form.address,
        verificationId: form.verificationId,
        operatingHours: form.operatingHours,
      })
      toast('Receiver account created.', 'success')
      navigate('/receiver', { replace: true })
    } catch (error: any) {
      toast(error.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create a Receiver Account"
      subtitle="Register your community organization and claim fresh food faster."
    >
      <div className="space-y-5">
        <Input label="NGO / Shelter / Food Bank Name" value={form.orgName} onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))} error={errors.orgName} icon={Building2} />
        <Input
          label="Government Registration ID / Tax Exempt Number"
          value={form.verificationId}
          onChange={(e) => setForm((p) => ({ ...p, verificationId: e.target.value }))}
          error={errors.verificationId}
          icon={BadgeCheck}
        />
        <Input label="Contact Person Name" value={form.contactPerson} onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))} error={errors.contactPerson} icon={UserRound} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} error={errors.email} icon={Mail} />
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} error={errors.phone} icon={Phone} />
        </div>
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} error={errors.password} icon={Lock} />
        <Input
          label="Delivery / Pickup Address"
          placeholder="Compatible with maps autocomplete and geocoding"
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          error={errors.address}
          icon={MapPin}
        />
        <Input
          label="Operating Hours"
          placeholder="e.g. Mon-Fri 9:00 AM - 6:00 PM"
          value={form.operatingHours}
          onChange={(e) => setForm((p) => ({ ...p, operatingHours: e.target.value }))}
          error={errors.operatingHours}
          icon={Clock3}
        />

        <Button variant="primary" className="w-full" loading={loading} onClick={submit}>
          Create Receiver Account
        </Button>

        <p className="text-sm text-text-secondary">
          Already have a receiver account?{' '}
          <Link to="/auth/login/receiver" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
