import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Building2,
  Cat,
  Dog,
  Bird,
  FileText,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import { speciesLabels, genderLabels } from '@/types'
import { cn } from '@/lib/utils'

interface FormData {
  animalId: string
  toStationId: string
  reason: string
}

const initialFormData: FormData = {
  animalId: '',
  toStationId: '',
  reason: '',
}

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  other: Bird,
}

export default function TransferForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preSelectedAnimalId = searchParams.get('animalId')

  const {
    loading,
    animals,
    stations,
    currentUser,
    fetchAnimals,
    fetchStations,
    fetchCurrentUser,
    createTransfer,
  } = useAppStore()

  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    animalId: preSelectedAnimalId || '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [animalDropdownOpen, setAnimalDropdownOpen] = useState(false)
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
    fetchAnimals()
    fetchStations()
  }, [fetchAnimals, fetchStations, fetchCurrentUser])

  useEffect(() => {
    if (preSelectedAnimalId) {
      setFormData((prev) => ({ ...prev, animalId: preSelectedAnimalId }))
    }
  }, [preSelectedAnimalId])

  const myStationId = currentUser?.stationId
  const availableAnimals = animals.filter(
    (a) => a.stationId === myStationId && a.status !== 'adopted' && a.status !== 'transferred',
  )
  const availableStations = stations.filter((s) => s.id !== myStationId)

  const selectedAnimal = animals.find((a) => a.id === formData.animalId)
  const selectedStation = stations.find((s) => s.id === formData.toStationId)
  const fromStation = stations.find((s) => s.id === myStationId)

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.animalId) {
      newErrors.animalId = '请选择要调配的动物'
    }
    if (!formData.toStationId) {
      newErrors.toStationId = '请选择目标站点'
    }
    if (!formData.reason.trim()) {
      newErrors.reason = '请填写调配原因'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await createTransfer(formData)
      setSubmitted(true)
      setTimeout(() => {
        navigate('/transfers')
      }, 2000)
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  const handleSelectAnimal = (animalId: string) => {
    setFormData((prev) => ({ ...prev, animalId }))
    setErrors((prev) => ({ ...prev, animalId: undefined }))
    setAnimalDropdownOpen(false)
  }

  const handleSelectStation = (stationId: string) => {
    setFormData((prev) => ({ ...prev, toStationId: stationId }))
    setErrors((prev) => ({ ...prev, toStationId: undefined }))
    setStationDropdownOpen(false)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[#1C1917]">申请已提交！</h2>
          <p className="mt-2 text-[#78716C]">调配请求已发送至目标站点等待审核</p>
          <p className="mt-4 text-sm text-[#A8A29E]">2秒后返回调配列表...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/transfers')}
          className="rounded-lg p-2 hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-5 w-5 text-[#57534E]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">发起跨站调配</h1>
          <p className="text-sm text-[#78716C]">将本站点动物调配至其他站点</p>
        </div>
      </div>

      {fromStation && (
        <div className="rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/80">调出站点</p>
              <p className="text-xl font-bold">{fromStation.name}</p>
              <p className="text-sm text-white/80">{fromStation.address}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">选择动物</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAnimalDropdownOpen(!animalDropdownOpen)}
              className={cn(
                'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                errors.animalId
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[#E7E5E4] focus:border-[#F97316]',
              )}
            >
              {selectedAnimal ? (
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedAnimal.photos[0]?.url ||
                      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'
                    }
                    alt={selectedAnimal.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-[#1C1917]">{selectedAnimal.name}</p>
                    <p className="text-xs text-[#78716C]">
                      {speciesLabels[selectedAnimal.species]} · {selectedAnimal.breed || '未知品种'} · {selectedAnimal.age}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-[#A8A29E]">请选择要调配的动物</span>
              )}
              <ChevronDown
                className={cn('h-5 w-5 text-[#78716C] transition-transform', animalDropdownOpen && 'rotate-180')}
              />
            </button>

            {animalDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-[#E7E5E4] bg-white shadow-lg">
                {availableAnimals.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#78716C]">
                    暂无可调配的动物
                  </div>
                ) : (
                  availableAnimals.map((animal) => {
                    const SpeciesIcon = speciesIcons[animal.species] || Cat
                    return (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => handleSelectAnimal(animal.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 hover:bg-[#F5F5F4] transition-colors',
                          formData.animalId === animal.id && 'bg-orange-50',
                        )}
                      >
                        <img
                          src={
                            animal.photos[0]?.url ||
                            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'
                          }
                          alt={animal.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[#1C1917]">{animal.name}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#78716C]">
                            <SpeciesIcon className="h-3 w-3" />
                            <span>{speciesLabels[animal.species]}</span>
                            <span className="text-[#D6D3D1]">·</span>
                            <span>{animal.breed || '未知品种'}</span>
                            <span className="text-[#D6D3D1]">·</span>
                            <span>{genderLabels[animal.gender]}</span>
                            <span className="text-[#D6D3D1]">·</span>
                            <span>{animal.age}</span>
                          </div>
                        </div>
                        {formData.animalId === animal.id && (
                          <Check className="h-5 w-5 text-[#F97316]" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
          {errors.animalId && <p className="mt-2 text-xs text-red-500">{errors.animalId}</p>}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">选择目标站点</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
              className={cn(
                'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                errors.toStationId
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[#E7E5E4] focus:border-[#F97316]',
              )}
            >
              {selectedStation ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1C1917]">{selectedStation.name}</p>
                    <p className="text-xs text-[#78716C]">{selectedStation.address}</p>
                  </div>
                </div>
              ) : (
                <span className="text-[#A8A29E]">请选择目标站点</span>
              )}
              <ChevronDown
                className={cn('h-5 w-5 text-[#78716C] transition-transform', stationDropdownOpen && 'rotate-180')}
              />
            </button>

            {stationDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-[#E7E5E4] bg-white shadow-lg">
                {availableStations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#78716C]">
                    暂无其他站点
                  </div>
                ) : (
                  availableStations.map((station) => (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => handleSelectStation(station.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-[#F5F5F4] transition-colors',
                        formData.toStationId === station.id && 'bg-orange-50',
                      )}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-[#1C1917]">{station.name}</p>
                        <p className="mt-0.5 text-xs text-[#78716C]">{station.address}</p>
                        <p className="mt-0.5 text-xs text-[#A8A29E]">
                          容量：{station.capacity} 只 · 联系电话：{station.phone}
                        </p>
                      </div>
                      {formData.toStationId === station.id && (
                        <Check className="h-5 w-5 text-[#F97316]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.toStationId && (
            <p className="mt-2 text-xs text-red-500">{errors.toStationId}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">调配原因</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
              <FileText className="h-4 w-4 text-[#78716C]" />
              请详细说明调配原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
                if (errors.reason) {
                  setErrors((prev) => ({ ...prev, reason: undefined }))
                }
              }}
              rows={5}
              placeholder="请详细说明调配原因，如：站点容量不足、动物特殊需求、品种调配优化等..."
              className={cn(
                'w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                errors.reason
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
              )}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">注意事项</p>
                <p className="mt-1">
                  调配申请提交后，需等待目标站点审核通过后方可执行。请确保填写的理由充分合理，
                  以便目标站点快速审核。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/transfers')}
            className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
          >
            <ArrowLeft className="h-4 w-4" />
            取消
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C] disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            提交申请
          </button>
        </div>
      </form>
    </div>
  )
}
