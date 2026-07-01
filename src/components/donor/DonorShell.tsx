import { Link } from 'react-router-dom'
import { Moon, Sun, Plus } from 'lucide-react'
import { DashboardLayout, TopBar } from '../layout/DashboardLayout'
import { Input } from '../ui/Input'
import { NotificationBell } from '../ui/SharedComponents'
import { useTheme } from '../../context/ThemeContext'
import { donorNavItems } from '../../pages/donor/donorNav'
import { useAuth } from '../../context/AuthContext'

export function DonorShell({
  children,
  fab = true,
}: {
  children: React.ReactNode
  fab?: boolean
}) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <DashboardLayout navItems={donorNavItems} role="donor">
      <TopBar
        search={<Input placeholder="Search donations, NGOs..." icon />}
        extra={
          <>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-text dark:text-gray-100"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <NotificationBell />
          </>
        }
        profile={
          <Link to="/donor/profile" className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary text-sm font-bold ring-2 ring-primary/20">
              {user?.name?.slice(0, 2).toUpperCase() || 'DN'}
            </span>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold">{user?.name || 'Donor'}</p>
              <p className="text-xs text-text-secondary">{user?.organization || 'Food Bridge'}</p>
            </div>
          </Link>
        }
      />
      {children}
      {fab && (
        <Link to="/donor/add" className="lg:hidden fixed bottom-20 right-4 z-30">
          <button className="w-14 h-14 rounded-2xl bg-primary text-white shadow-elevated flex items-center justify-center hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </button>
        </Link>
      )}
    </DashboardLayout>
  )
}
