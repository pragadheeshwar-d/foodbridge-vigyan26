import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

export function Logo({ size = 'md', light = false }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  }
  const s = sizes[size]

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`${s.icon} rounded-xl bg-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform`}>
        <Leaf className="w-1/2 h-1/2 text-white" />
      </div>
      <span className={`${s.text} font-bold tracking-tight ${light ? 'text-white' : 'text-text dark:text-white'}`}>
        Food<span className="text-primary">Bridge</span>
      </span>
    </Link>
  )
}
