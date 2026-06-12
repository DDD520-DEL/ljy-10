import { TrendingUp, TrendingDown, Minus, PawPrint, Heart, Stethoscope, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export type StatsType = 'total' | 'available' | 'tnr' | 'visit'

export interface StatsCardProps {
  type: StatsType
  value: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

const typeConfig: Record<StatsType, {
  label: string
  icon: LucideIcon
  gradient: string
  bgColor: string
  textColor: string
  iconBg: string
}> = {
  total: {
    label: '动物总数',
    icon: PawPrint,
    gradient: 'from-orange-400 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  available: {
    label: '待领养',
    icon: Heart,
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  tnr: {
    label: 'TNR进行中',
    icon: Stethoscope,
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  visit: {
    label: '本月回访',
    icon: CalendarCheck,
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
  },
}

export default function StatsCard({ type, value, trend, trendValue }: StatsCardProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-r">
      <div className={cn('absolute inset-0 bg-gradient-to-r', config.gradient, 'opacity-100')} />
      <div className="relative bg-white rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{config.label}</p>
            <p className={cn('text-3xl font-bold', config.textColor)}>{value}</p>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                <TrendIcon className={cn('h-4 w-4', trendColor)} />
                <span className={cn('text-sm', trendColor)}>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3', config.iconBg)}>
            <Icon className={cn('h-6 w-6', config.textColor)} />
          </div>
        </div>
      </div>
    </div>
  )
}
