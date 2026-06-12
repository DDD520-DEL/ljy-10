import { Heart, Syringe, Home, Stethoscope, Calendar, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export type ActivityType = 'adoption' | 'rescue' | 'tnr' | 'health' | 'visit' | 'batch_import'

export interface ActivityItemProps {
  type: ActivityType
  title: string
  description: string
  time: string
}

const typeConfig: Record<ActivityType, {
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
}> = {
  adoption: {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-l-pink-500',
  },
  rescue: {
    icon: Home,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-l-orange-500',
  },
  tnr: {
    icon: Syringe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-l-blue-500',
  },
  health: {
    icon: Stethoscope,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-l-green-500',
  },
  visit: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-l-purple-500',
  },
  batch_import: {
    icon: Database,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-l-indigo-500',
  },
}

export default function ActivityItem({ type, title, description, time }: ActivityItemProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-4 border-l-4 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        config.borderColor,
      )}
    >
      <div className={cn('rounded-lg p-2', config.bgColor)}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        <p className="mt-2 text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
}
