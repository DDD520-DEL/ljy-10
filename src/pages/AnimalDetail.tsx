import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Edit,
  Syringe,
  Heart,
  ArrowRightLeft,
  History,
  MapPin,
  Calendar,
  Mars,
  Venus,
  HelpCircle,
  Cat,
  Dog,
  Bird,
  ArrowLeft,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusBadge from '@/components/StatusBadge'
import TNRStep from '@/components/TNRStep'
import PhotoWall from '@/components/PhotoWall'
import type { PhotoItem, PhotoTag } from '@/components/PhotoWall'
import {
  speciesLabels,
  genderLabels,
  statusLabels,
  type Animal,
} from '@/types'
import { cn } from '@/lib/utils'

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  other: Cat,
}

const photoTypeMap: Record<string, Exclude<PhotoTag, 'all'>> = {
  pre_surgery: 'preoperative',
  post_surgery: 'postoperative',
  adoption: 'adopted',
  found: 'rescue',
  vaccine: 'rescue',
  release: 'rescue',
  followup: 'rescue',
}

function getTNRCurrentStep(animal: Animal): 0 | 1 | 2 | 3 {
  const { tnrProgress } = animal
  if (tnrProgress.release) return 4 as unknown as 0 | 1 | 2 | 3
  if (tnrProgress.vaccine) return 3
  if (tnrProgress.neuter) return 2
  if (tnrProgress.trap) return 1
  return 0
}

function adaptPhotos(animal: Animal): PhotoItem[] {
  return animal.photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    title: photo.caption || statusLabels[animal.status],
    tag: photoTypeMap[photo.type] || 'rescue',
  }))
}

export default function AnimalDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { loading, currentAnimal, stations, fetchAnimalById, clearCurrentAnimal } = useAppStore()

  useEffect(() => {
    if (id) {
      fetchAnimalById(id)
    }
    return () => {
      clearCurrentAnimal()
    }
  }, [id, fetchAnimalById, clearCurrentAnimal])

  if (loading) {
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

  const station = stations.find((s) => s.id === currentAnimal.stationId)
  const SpeciesIcon = speciesIcons[currentAnimal.species] || Cat
  const GenderIcon = currentAnimal.gender === 'male' ? Mars : currentAnimal.gender === 'female' ? Venus : HelpCircle
  const genderColor = currentAnimal.gender === 'male' ? 'text-blue-500' : currentAnimal.gender === 'female' ? 'text-pink-500' : 'text-gray-500'
  const tnrStep = getTNRCurrentStep(currentAnimal)
  const photos = adaptPhotos(currentAnimal)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/animals')}
          className="rounded-lg p-2 hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-5 w-5 text-[#57534E]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1C1917]">{currentAnimal.name}</h1>
            <StatusBadge status={currentAnimal.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-[#78716C]">
            <div className="flex items-center gap-1">
              <SpeciesIcon className="h-4 w-4" />
              <span>{speciesLabels[currentAnimal.species]}</span>
              <span className="text-[#D6D3D1]">·</span>
              <span>{currentAnimal.breed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">基本信息</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-[#A8A29E]">物种</p>
                <div className="flex items-center gap-2">
                  <SpeciesIcon className="h-4 w-4 text-[#57534E]" />
                  <span className="font-medium text-[#1C1917]">{speciesLabels[currentAnimal.species]}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#A8A29E]">品种</p>
                <p className="font-medium text-[#1C1917]">{currentAnimal.breed || '未知'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#A8A29E]">年龄</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#57534E]" />
                  <span className="font-medium text-[#1C1917]">{currentAnimal.age}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#A8A29E]">性别</p>
                <div className="flex items-center gap-2">
                  <GenderIcon className={cn('h-4 w-4', genderColor)} />
                  <span className="font-medium text-[#1C1917]">{genderLabels[currentAnimal.gender]}</span>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-[#A8A29E]">发现位置</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#57534E]" />
                  <span className="font-medium text-[#1C1917]">{currentAnimal.foundLocation}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#A8A29E]">健康状况</p>
                <p className="font-medium text-[#1C1917]">{currentAnimal.healthStatus}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#A8A29E]">所属站点</p>
                <p className="font-medium text-[#1C1917]">{station?.name || '未知'}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-[#A8A29E]">性格描述</p>
                <p className="font-medium text-[#1C1917]">{currentAnimal.personality || '暂无描述'}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-[#A8A29E]">详细描述</p>
                <p className="font-medium text-[#1C1917]">{currentAnimal.description || '暂无描述'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">TNR进度</h2>
            <TNRStep currentStep={tnrStep as 0 | 1 | 2 | 3} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">照片墙</h2>
            {photos.length > 0 ? (
              <PhotoWall photos={photos} />
            ) : (
              <div className="py-12 text-center text-gray-500">
                暂无照片
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">操作</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/animals/${currentAnimal.id}/edit`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                <Edit className="h-4 w-4" />
                编辑信息
              </button>
              <button
                onClick={() => navigate(`/animals/${currentAnimal.id}/tnr`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                <Syringe className="h-4 w-4" />
                记录TNR
              </button>
              <button
                onClick={() => navigate(`/adoption/publish?animalId=${currentAnimal.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                <Heart className="h-4 w-4" />
                发布领养
              </button>
              <button
                onClick={() => navigate(`/transfer/new?animalId=${currentAnimal.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                <ArrowRightLeft className="h-4 w-4" />
                发起调配
              </button>
              <button
                onClick={() => navigate(`/animals/${currentAnimal.id}/lifecycle`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
              >
                <History className="h-4 w-4" />
                查看生命周期时间轴
              </button>
            </div>
          </div>

          {currentAnimal.adoptionInfo && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">领养信息</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-[#A8A29E]">领养人</p>
                  <p className="font-medium text-[#1C1917]">{currentAnimal.adoptionInfo.adopterName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#A8A29E]">领养日期</p>
                  <p className="font-medium text-[#1C1917]">
                    {new Date(currentAnimal.adoptionInfo.adoptedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#A8A29E]">协议编号</p>
                  <p className="font-medium text-[#1C1917]">{currentAnimal.adoptionInfo.agreementId}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] p-6 text-white">
            <h3 className="text-lg font-semibold">提示</h3>
            <p className="mt-2 text-sm text-white/90">
              点击"查看生命周期时间轴"可以浏览该动物从救助到领养的完整记录。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
