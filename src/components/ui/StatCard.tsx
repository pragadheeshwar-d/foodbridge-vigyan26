import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  color?: string
  delay?: number
}

export function StatCard({ title, value, change, icon: Icon, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-text dark:text-white tracking-tight">{value}</p>
          {change && (
            <p className="text-xs text-primary font-medium mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-primary/10 ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div className={`glass-card p-6 ${hover ? 'hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5' : ''} ${className}`}>
      {children}
    </div>
  )
}
