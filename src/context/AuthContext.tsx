/**
 * AuthContext — backed by Flask JWT REST API.
 * Replaces the previous Firebase Auth implementation.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

export type UserRole = 'donor' | 'receiver' | 'admin' | 'super_admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  organization?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  phone?: string
  address?: string
  avatarUrl?: string
  verified?: boolean
}

interface RegisterInput {
  name: string
  organization?: string
  email: string
  password: string
  role: UserRole
  phone?: string
  address?: string
  businessType?: string
  verificationId?: string
  operatingHours?: string
}

interface LoginInput {
  email: string
  password: string
  role?: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** Map raw API user object → AuthUser */
function mapUser(raw: Record<string, any>): AuthUser {
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role as UserRole,
    organization: raw.organization ?? undefined,
    status: (raw.status ?? 'pending') as AuthUser['status'],
    phone: raw.phone ?? undefined,
    address: raw.address ?? undefined,
    avatarUrl: raw.profile_image ?? undefined,
    verified: raw.verified ?? false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /** Hydrate user from localStorage on first render */
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored)
        setUser(mapUser(parsed))
        // Connect socket with the stored user id
        connectSocket(parsed.id)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/profile')
      const updated = mapUser(res.data.user)
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch {
      // token likely expired — handled by axios interceptor
    }
  }

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,

      login: async ({ email, password, role }) => {
        const res = await api.post('/auth/login', { email, password, role })
        const { token, user: rawUser } = res.data

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(rawUser))

        const authUser = mapUser(rawUser)
        setUser(authUser)
        connectSocket(authUser.id)
        return authUser
      },

      register: async (input) => {
        const payload = {
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
          organization: input.organization,
          phone: input.phone,
          address: input.address,
          businessType: input.businessType,
          verificationId: input.verificationId,
          operatingHours: input.operatingHours,
        }
        const res = await api.post('/auth/register', payload)
        const rawUser = res.data.user
        return mapUser(rawUser)
      },

      logout: async () => {
        disconnectSocket()
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      },

      refreshUser,
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
