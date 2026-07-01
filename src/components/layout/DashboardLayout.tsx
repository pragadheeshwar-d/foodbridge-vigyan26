import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, ChevronLeft } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  role: 'donor' | 'receiver' | 'admin'
}

export function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

  const roleColors = {
    donor: 'from-primary/20 to-primary-light/10',
    receiver: 'from-blue-500/20 to-blue-400/10',
    admin: 'from-purple-500/20 to-purple-400/10',
  }

  return (
    <div className="min-h-screen flex bg-surface dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="p-5 flex items-center justify-between">
          {!collapsed && <Logo light size="sm" />}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">FB</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-hover text-gray-400 hidden lg:block"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const active = item.path === '/donor' || item.path === '/receiver' || item.path === '/admin'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className={`sidebar-link w-full text-left ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-72 bg-sidebar z-50 lg:hidden flex flex-col"
            >
              <div className="p-5 flex items-center justify-between">
                <Logo light size="sm" />
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const active = item.path === '/donor' || item.path === '/receiver' || item.path === '/admin'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        collapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Mobile Header Bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="sm" />
        </div>

        {/* Page gradient accent */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-radial ${roleColors[role]} blur-3xl opacity-50 pointer-events-none`} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-20 px-2 py-2">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => {
              const active = item.path === '/donor' || item.path === '/receiver' || item.path === '/admin'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                    active ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

export function TopBar({ search, profile, extra }: {
  search?: React.ReactNode
  profile?: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {search && <div className="flex-1 max-w-md">{search}</div>}
      <div className="flex items-center gap-2 ml-auto">
        {extra}
        {profile}
      </div>
    </div>
  )
}
