import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthShell } from './AuthShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

export function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast('Please enter your email.', 'warning'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast('Reset link sent! Check your inbox.', 'success')
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to send reset link', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      {sent ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-green-600 font-semibold">✓ Reset link sent to {email}</p>
          <p className="text-sm text-text-secondary">Check your inbox and follow the link to create a new password.</p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />
          <Button variant="primary" className="w-full" type="submit" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const token = searchParams.get('token') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 8) {
      toast('Password must be at least 8 characters.', 'warning')
      return
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast('Password reset successfully. Please log in.', 'success')
      navigate('/auth/login/donor', { replace: true })
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to reset password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create a new password"
      subtitle="Use a strong password to protect your FoodBridge account."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={Lock}
          required
        />
        <Button variant="primary" className="w-full" type="submit" loading={loading}>
          Update Password
        </Button>
      </form>
    </AuthShell>
  )
}

/** Email verification landing page */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const token = searchParams.get('token') || ''

  const verify = async () => {
    if (!token) { toast('No verification token found.', 'error'); return }
    setStatus('loading')
    try {
      await api.post('/auth/verify-email', { token })
      setStatus('success')
      toast('Email verified! You can now log in.', 'success')
      setTimeout(() => navigate('/auth/login/donor'), 2000)
    } catch (err: any) {
      setStatus('error')
      toast(err?.response?.data?.message || 'Verification failed', 'error')
    }
  }

  return (
    <AuthShell title="Verify your email" subtitle="Click below to confirm your email address.">
      <div className="text-center space-y-4">
        {status === 'success' && (
          <p className="text-green-600 font-semibold">✓ Email verified! Redirecting to login...</p>
        )}
        {status === 'error' && (
          <p className="text-red-600">Verification failed. The link may have expired.</p>
        )}
        {(status === 'idle' || status === 'error') && (
          <Button
            variant="primary"
            className="w-full"
            loading={status === 'loading' as any}
            onClick={verify}
          >
            Verify Email
          </Button>
        )}
      </div>
    </AuthShell>
  )
}
