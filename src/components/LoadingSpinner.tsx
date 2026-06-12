import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-[#F97316] border-t-transparent',
          sizeClasses[size],
          className,
        )}
      />
    </div>
  )
}
