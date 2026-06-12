import { ArrowRightLeft, Building2, Clock, MapPin } from 'lucide-react'
import type { AnimalTransfer, Station } from '@/types'
import { transferStatusLabels } from '@/types'
import { cn } from '@/lib/utils'

interface TransferCardProps {
  transfer: AnimalTransfer
  fromStation?: Station
  toStation?: Station
  onClick?: () => void
  className?: string
}

const statusColors: Record<AnimalTransfer['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}

const statusDotColors: Record<AnimalTransfer['status'], string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-blue-500',
  rejected: 'bg-red-500',
  completed: 'bg-green-500',
}

export default function TransferCard({
  transfer,
  fromStation,
  toStation,
  onClick,
  className,
}: TransferCardProps) {
  const from = fromStation || transfer.fromStation
  const to = toStation || transfer.toStation

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-white shadow-sm p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            statusColors[transfer.status]
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColors[transfer.status])} />
            {transferStatusLabels[transfer.status]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#78716C]">
          <Clock className="h-3 w-3" />
          <span>{transfer.createdAt?.split('T')[0] || '-'}</span>
        </div>
      </div>

      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-2">
            <Building2 className="h-6 w-6 text-[#F97316]" />
          </div>
          <p className="font-medium text-[#1C1917] text-sm line-clamp-1">
            {from?.name || '原站点'}
          </p>
          {from?.address && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#78716C]">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{from.address}</span>
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center px-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-[#F97316]/30 via-[#F97316] to-[#22C55E]/30" />
          </div>
          <div className="relative z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-[#F97316]">
            <ArrowRightLeft className="h-5 w-5 text-[#F97316] animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-[#F97316] animate-ping opacity-50" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-2">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <p className="font-medium text-[#1C1917] text-sm line-clamp-1">
            {to?.name || '目标站点'}
          </p>
          {to?.address && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#78716C]">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{to.address}</span>
            </div>
          )}
        </div>
      </div>

      {transfer.reason && (
        <div className="mt-4 pt-4 border-t border-[#E7E5E4]">
          <p className="text-sm text-[#78716C] line-clamp-2">
            <span className="font-medium text-[#44403C]">调配原因：</span>
            {transfer.reason}
          </p>
        </div>
      )}

      {transfer.animal && (
        <div className="mt-3 flex items-center gap-2">
          <img
            src={transfer.animal.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square'}
            alt={transfer.animal.name}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-sm text-[#57534E]">{transfer.animal.name}</span>
        </div>
      )}
    </div>
  )
}
