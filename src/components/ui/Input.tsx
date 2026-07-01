import { Search, type LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: boolean | LucideIcon
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  const Icon = icon === true ? Search : icon || null

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text dark:text-gray-200">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        )}
        <input
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-200' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text dark:text-gray-200">{label}</label>
      )}
      <select className={`input-field appearance-none cursor-pointer ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text dark:text-gray-200">{label}</label>
      )}
      <textarea className={`input-field min-h-[100px] resize-y ${className}`} {...props} />
    </div>
  )
}
