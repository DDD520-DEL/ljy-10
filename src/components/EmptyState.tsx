import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center',
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#1C1917]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[#78716C] max-w-sm">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
