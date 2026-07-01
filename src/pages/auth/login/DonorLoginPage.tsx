import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { AuthShell } from '../AuthShell'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { useState } from 'react'

/** Returns the correct dashboard path for a given role */
function dashboardFor(role: string): string {
  if (role === 'admin' || role === 'super_admin') return '/admin'
  if (role === 'receiver') return '/receiver'
  return '/donor'
}

export function DonorLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Only use the redirect param if it isn't the default donor path
  const redirectParam = searchParams.get('redirect')

  return (
    <AuthShell
      title="Sign in to FoodBridge"
      subtitle="Donors and admins — manage surplus donations and track your impact."
    >
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!email || !password) {
            toast('Please enter your email and password.', 'warning')
            return
          }
          setLoading(true)
          try {
            const authUser = await login({ email, password })
            toast('Signed in successfully.', 'success')

            // Always redirect based on the actual role returned from the server
            const destination = redirectParam || dashboardFor(authUser.role)
            navigate(destination, { replace: true })
          } catch (error: any) {
            // Surface the server's error message clearly
            const msg =
              error?.response?.data?.message ||
              error?.message ||
              'Login failed. Please check your credentials.'
            toast(msg, 'error')
          } finally {
            setLoading(false)
          }
        }}
      >
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          autoComplete="current-password"
        />

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Sign In
        </Button>

        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            Recipient organisation?{' '}
            <Link to="/auth/login/receiver" className="text-primary font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link className="text-primary font-medium" to="/auth/forgot-password">
            Forgot password?
          </Link>
          <Link
            className="inline-flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
            to="/auth/signup"
          >
            Create account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
