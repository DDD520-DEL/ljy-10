import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Syringe,
  Heart,
  FileCheck,
  Handshake,
  Calendar,
  ArrowRightLeft,
  Search,
  Cat,
  Dog,
  Bird,
  User,
  Image as ImageIcon,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  speciesLabels,
  genderLabels,
  type LifecycleEventType,
  type LifecycleEvent,
} from '@/types'
import { cn } from '@/lib/utils'

const eventConfig: Record<
  LifecycleEventType,
  { label: string; icon: typeof MapPin; color: string; bgColor: string; borderColor: string }
> = {
  found: {
    label: '发现',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  trap: {
    label: '诱捕',
    icon: Syringe,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  neuter: {
    label: '绝育',
    icon: Syringe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  vaccine: {
    label: '免疫',
    icon: Syringe,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  release: {
    label: '放归',
    icon: MapPin,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  adoption_published: {
    label: '发布领养',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  application_submitted: {
    label: '领养申请',
    icon: FileCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  application_approved: {
    label: '审核通过',
    icon: FileCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  agreement_signed: {
    label: '协议签订',
    icon: Handshake,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  adopted: {
    label: '正式领养',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  followup: {
    label: '回访',
    icon: Calendar,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  transfer: {
    label: '跨站调配',
    icon: ArrowRightLeft,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
}

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  other: Bird,
}

function getDefaultConfig(type: string) {
  return eventConfig[type as LifecycleEventType] || {
    label: type,
    icon: FileCheck,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  }
}

export default function LifecycleTimeline() {
  const navigate = useNavigate()
  const { animalId } = useParams<{ animalId: string }>()

  const { loading, currentAnimal, lifecycleEvents, fetchAnimalById, fetchLifecycle, clearCurrentAnimal } =
    useAppStore()

  useEffect(() => {
    if (animalId) {
      fetchAnimalById(animalId)
      fetchLifecycle(animalId)
    }
    return () => {
      clearCurrentAnimal()
    }
  }, [animalId, fetchAnimalById, fetchLifecycle, clearCurrentAnimal])

  if (loading && lifecycleEvents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentAnimal) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center">
        <p className="text-gray-500">未找到该动物信息</p>
        <button
          onClick={() => navigate('/animals')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </button>
      </div>
    )
  }

  const SpeciesIcon = speciesIcons[currentAnimal.species] || Cat
  const sortedEvents = [...lifecycleEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/animals/${animalId}`)}
          className="rounded-lg p-2 hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-5 w-5 text-[#57534E]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">生命周期时间轴</h1>
          <p className="text-sm text-[#78716C]">{currentAnimal.name} 的完整生命历程</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={currentAnimal.photos[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'}
            alt={currentAnimal.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#1C1917]">{currentAnimal.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#78716C]">
              <span className="flex items-center gap-1">
                <SpeciesIcon className="h-4 w-4" />
                {speciesLabels[currentAnimal.species]}
              </span>
              <span className="text-[#D6D3D1]">·</span>
              <span>{currentAnimal.breed || '未知品种'}</span>
              <span className="text-[#D6D3D1]">·</span>
              <span>{genderLabels[currentAnimal.gender]}</span>
              <span className="text-[#D6D3D1]">·</span>
              <span>{currentAnimal.age}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#F97316] via-orange-300 to-[#FED7AA]" />

        {sortedEvents.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center">
            <p className="text-gray-500">暂无生命周期记录</p>
          </div>
        ) : (
          <div className="space-y-8 py-8">
            {sortedEvents.map((event, index) => {
              const config = getDefaultConfig(event.type)
              const EventIcon = config.icon
              const isLeft = index % 2 === 0

              return (
                <div
                  key={event.id}
                  className={cn(
                    'relative flex items-center gap-8',
                    isLeft ? 'flex-row' : 'flex-row-reverse',
                  )}
                >
                  <div className="w-5/12">
                    <div
                      className={cn(
                        'rounded-2xl border-2 p-6 shadow-sm transition-all duration-300 hover:shadow-md',
                        config.bgColor,
                        config.borderColor,
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            config.bgColor,
                            config.borderColor,
                            'border',
                          )}
                        >
                          <EventIcon className={cn('h-5 w-5', config.color)} />
                        </div>
                        <div>
                          <h3 className={cn('text-lg font-bold', config.color)}>
                            {config.label}
                          </h3>
                          <p className="text-xs text-[#78716C]">
                            {new Date(event.date).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <h4 className="text-base font-semibold text-[#1C1917] mb-2">
                        {event.title}
                      </h4>
                      <p className="text-sm text-[#57534E] leading-relaxed">
                        {event.description}
                      </p>

                      {event.operator && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-[#78716C]">
                          <User className="h-4 w-4" />
                          <span>操作人：{event.operator}</span>
                        </div>
                      )}

                      {event.photos && event.photos.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-2">
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>照片 ({event.photos.length})</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {event.photos.map((photo, photoIndex) => (
                              <div
                                key={photoIndex}
                                className="relative h-20 w-20 overflow-hidden rounded-lg"
                              >
                                <img
                                  src={photo}
                                  alt={`${event.title} - ${photoIndex + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'absolute left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white shadow-lg z-10',
                      config.bgColor,
                    )}
                  >
                    <EventIcon className={cn('h-5 w-5', config.color)} />
                  </div>

                  <div className="w-5/12" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center pb-8">
        <button
          onClick={() => navigate(`/animals/${animalId}`)}
          className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回详情页
        </button>
      </div>
    </div>
  )
}
