import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, MapPin, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { AuthShell } from '../AuthShell'
import { Button } from '../../../components/ui/Button'
import { Input, Select } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'household', label: 'Household' },
  { value: 'supermarket', label: 'Supermarket' },
]

export function DonorSignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    primaryContact: '',
    orgName: '',
    businessType: 'restaurant',
    email: '',
    phone: '',
    password: '',
    address: '',
  })

  const submit = async () => {
    const nextErrors: Record<string, string> = {}
    if (!form.primaryContact) nextErrors.primaryContact = 'Primary contact is required.'
    if (!form.orgName) nextErrors.orgName = 'Organization name is required.'
    if (!form.email) nextErrors.email = 'Email is required.'
    if (!form.phone) nextErrors.phone = 'Phone number is required.'
    if (!form.password || form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!form.address) nextErrors.address = 'Address is required.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await register({
        name: form.primaryContact,
        organization: form.orgName,
        email: form.email,
        password: form.password,
        role: 'donor',
        phone: form.phone,
        address: form.address,
        businessType: form.businessType,
      })
      toast('Donor account created.', 'success')
      navigate('/donor', { replace: true })
    } catch (error: any) {
      toast(error.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create a Donor Account"
      subtitle="Set up your business profile to list surplus food and track every pickup."
    >
      <div className="space-y-5">
        <Input label="Full Name / Primary Contact" value={form.primaryContact} onChange={(e) => setForm((p) => ({ ...p, primaryContact: e.target.value }))} error={errors.primaryContact} icon={UserRound} />
        <Input label="Business / Organization Name" value={form.orgName} onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))} error={errors.orgName} icon={Building2} />
        <Select
          label="Business Type"
          value={form.businessType}
          onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
          options={businessTypes}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} error={errors.email} icon={Mail} />
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} error={errors.phone} icon={Phone} />
        </div>
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} error={errors.password} icon={Lock} />
        <Input
          label="Address"
          placeholder="Searchable address with geocoding/autocomplete compatibility"
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          error={errors.address}
          icon={MapPin}
        />
        <p className="text-xs text-text-secondary">
          This field is ready for Google Maps autocomplete or geocoding integration later.
        </p>

        <Button variant="primary" className="w-full" loading={loading} onClick={submit}>
          Create Donor Account
        </Button>

        <p className="text-sm text-text-secondary">
          Already have a donor account?{' '}
          <Link to="/auth/login/donor" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
