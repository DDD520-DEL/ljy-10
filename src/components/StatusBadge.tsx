import { AnimalStatus, statusLabels } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: AnimalStatus
  className?: string
}

const statusStyles: Record<AnimalStatus, string> = {
  rescued: 'bg-blue-100 text-blue-800 border-blue-200',
  tnr_in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  tnr_completed: 'bg-purple-100 text-purple-800 border-purple-200',
  available: 'bg-green-100 text-green-800 border-green-200',
  adopted: 'bg-pink-100 text-pink-800 border-pink-200',
  released: 'bg-gray-100 text-gray-800 border-gray-200',
  transferred: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className,
      )}
    >
      <span className={cn(
        'mr-1.5 h-1.5 w-1.5 rounded-full',
        status === 'rescued' && 'bg-blue-500',
        status === 'tnr_in_progress' && 'bg-orange-500',
        status === 'tnr_completed' && 'bg-purple-500',
        status === 'available' && 'bg-green-500',
        status === 'adopted' && 'bg-pink-500',
        status === 'released' && 'bg-gray-500',
        status === 'transferred' && 'bg-yellow-500',
      )} />
      {statusLabels[status]}
    </span>
  )
}
