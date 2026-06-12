import {
  PawPrint,
  Target,
  Scissors,
  Syringe,
  Bird,
  Heart,
  FileText,
  CheckCircle,
  Signature,
  Home,
  CalendarDays,
  ArrowRightLeft,
  type LucideIcon,
} from 'lucide-react'
import type { LifecycleEvent as LifecycleEventType } from '@/types'
import { cn } from '@/lib/utils'

interface LifecycleEventProps {
  event: LifecycleEventType
  isLast?: boolean
  className?: string
}

const eventIcons: Record<LifecycleEventType['type'], LucideIcon> = {
  found: PawPrint,
  trap: Target,
  neuter: Scissors,
  vaccine: Syringe,
  release: Bird,
  adoption_published: Heart,
  application_submitted: FileText,
  application_approved: CheckCircle,
  agreement_signed: Signature,
  adopted: Home,
  followup: CalendarDays,
  transfer: ArrowRightLeft,
}

const eventColors: Record<LifecycleEventType['type'], { bg: string; icon: string; border: string }> = {
  found: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-300' },
  trap: { bg: 'bg-orange-100', icon: 'text-orange-600', border: 'border-orange-300' },
  neuter: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-300' },
  vaccine: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-300' },
  release: { bg: 'bg-teal-100', icon: 'text-teal-600', border: 'border-teal-300' },
  adoption_published: { bg: 'bg-pink-100', icon: 'text-pink-600', border: 'border-pink-300' },
  application_submitted: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-300' },
  application_approved: { bg: 'bg-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-300' },
  agreement_signed: { bg: 'bg-indigo-100', icon: 'text-indigo-600', border: 'border-indigo-300' },
  adopted: { bg: 'bg-rose-100', icon: 'text-rose-600', border: 'border-rose-300' },
  followup: { bg: 'bg-cyan-100', icon: 'text-cyan-600', border: 'border-cyan-300' },
  transfer: { bg: 'bg-amber-100', icon: 'text-amber-600', border: 'border-amber-300' },
}

export default function LifecycleEvent({ event, isLast, className }: LifecycleEventProps) {
  const Icon = eventIcons[event.type] || PawPrint
  const colors = eventColors[event.type] || eventColors.found

  return (
    <div className={cn('relative flex gap-4', className)}>
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-[#E7E5E4] to-transparent" />
      )}

      <div className={cn(
        'relative z-10 flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center',
        colors.bg,
        colors.border
      )}>
        <Icon className={cn('h-6 w-6', colors.icon)} />
      </div>

      <div className="flex-1 pb-6">
        <div className="rounded-xl bg-white shadow-sm p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-[#1C1917]">{event.title}</h4>
              <p className="text-sm text-[#78716C] mt-1">{event.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-medium text-[#57534E]">
                {event.date?.split('T')[0] || '-'}
              </p>
              {event.operator && (
                <p className="text-xs text-[#A8A29E] mt-0.5">操作人：{event.operator}</p>
              )}
            </div>
          </div>

          {event.photos && event.photos.length > 0 && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#F5F5F4]">
              {event.photos.slice(0, 4).map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`${event.title} 照片`}
                  className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
              {event.photos.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-sm font-medium text-[#78716C]">
                  +{event.photos.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
