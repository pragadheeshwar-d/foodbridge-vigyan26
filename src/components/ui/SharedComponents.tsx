import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotifications()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 glass-card z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                  <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-text-secondary" /></button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-text-secondary">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id)
                      }}
                      className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{n.message}</p>
                          <p className="text-xs text-text-secondary/60 mt-1">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString() : n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                          </p>
                          {n.link && (
                            <Link to={n.link} className="text-xs text-primary mt-1 inline-block hover:underline" onClick={() => setOpen(false)}>
                              View details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-secondary" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-4">{description}</p>
      {action}
    </div>
  )
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Pagination({ current = 1, total = 5 }: { current?: number; total?: number }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-text-secondary">Page {current} of {total}</p>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              i + 1 === current
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TimelineStep({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= currentStep
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-text-secondary'
            }`}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <p className={`text-xs mt-1.5 text-center max-w-[80px] ${
              i <= currentStep ? 'text-primary font-medium' : 'text-text-secondary'
            }`}>{step}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${
              i < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}
