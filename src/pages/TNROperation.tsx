import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Image as ImageIcon,
  Syringe,
  MapPin,
  Calendar,
  User,
  DollarSign,
  FileText,
  Check,
  Cat,
  Dog,
  Bird,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusBadge from '@/components/StatusBadge'
import TNRStep from '@/components/TNRStep'
import {
  tnrTypeLabels,
  speciesLabels,
  genderLabels,
  statusLabels,
  type TNRType,
  type Animal,
} from '@/types'
import { cn } from '@/lib/utils'

interface FormData {
  type: TNRType
  date: string
  location: string
  hospital: string
  operator: string
  cost: string
  notes: string
}

interface PhotoInput {
  url: string
  caption: string
}

const tnrSteps: { id: TNRType; label: string; description: string; icon: typeof Syringe }[] = [
  { id: 'trap', label: '诱捕', description: '捕捉流浪动物', icon: Syringe },
  { id: 'neuter', label: '绝育', description: '进行绝育手术', icon: Syringe },
  { id: 'vaccine', label: '免疫', description: '接种疫苗', icon: Syringe },
  { id: 'release', label: '放归', description: '放归原栖息地', icon: Syringe },
]

const photoTypeMap: Record<TNRType, string> = {
  trap: 'pre_surgery',
  neuter: 'post_surgery',
  vaccine: 'vaccine',
  release: 'release',
}

const initialFormData: FormData = {
  type: 'trap',
  date: new Date().toISOString().split('T')[0],
  location: '',
  hospital: '',
  operator: '',
  cost: '',
  notes: '',
}

const initialPhoto: PhotoInput = {
  url: '',
  caption: '',
}

function getTNRCurrentStep(animal: Animal): 0 | 1 | 2 | 3 {
  const { tnrProgress } = animal
  if (tnrProgress.release) return 3
  if (tnrProgress.vaccine) return 2
  if (tnrProgress.neuter) return 1
  if (tnrProgress.trap) return 0
  return 0
}

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  other: Bird,
}

export default function TNROperation() {
  const navigate = useNavigate()
  const { animalId } = useParams<{ animalId: string }>()

  const {
    loading,
    currentAnimal,
    fetchAnimalById,
    createTNROperation,
    clearCurrentAnimal,
  } = useAppStore()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [photos, setPhotos] = useState<PhotoInput[]>([initialPhoto])
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (animalId) {
      fetchAnimalById(animalId)
    }
    return () => {
      clearCurrentAnimal()
    }
  }, [animalId, fetchAnimalById, clearCurrentAnimal])

  useEffect(() => {
    if (currentAnimal) {
      const step = getTNRCurrentStep(currentAnimal)
      const nextType = tnrSteps[step]?.id || 'trap'
      setFormData((prev) => ({ ...prev, type: nextType }))
    }
  }, [currentAnimal])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.date) {
      newErrors.date = '请选择操作日期'
    }
    if (!formData.location.trim() && !formData.hospital.trim()) {
      newErrors.location = '请填写地点或医院'
    }
    if (!formData.operator.trim()) {
      newErrors.operator = '请填写操作人员'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleTypeSelect = (type: TNRType) => {
    setFormData((prev) => ({ ...prev, type }))
  }

  const handlePhotoChange = (index: number, field: keyof PhotoInput, value: string) => {
    setPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, [field]: value } : photo)),
    )
  }

  const addPhoto = () => {
    setPhotos((prev) => [...prev, { ...initialPhoto }])
  }

  const removePhoto = (index: number) => {
    if (photos.length > 1) {
      setPhotos((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !animalId) {
      return
    }

    try {
      const validPhotos = photos.filter((p) => p.url.trim()).map((p) => ({
        url: p.url,
        type: photoTypeMap[formData.type],
        caption: p.caption,
      }))

      const operationData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        photos: validPhotos,
      }

      await createTNROperation(animalId, operationData)
      setSubmitted(true)
      setTimeout(() => {
        navigate(`/animals/${animalId}`)
      }, 2000)
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[#1C1917]">记录成功！</h2>
          <p className="mt-2 text-[#78716C]">TNR操作记录已保存</p>
          <p className="mt-4 text-sm text-[#A8A29E]">2秒后返回动物详情页...</p>
        </div>
      </div>
    )
  }

  if (loading && !currentAnimal) {
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

  const tnrStep = getTNRCurrentStep(currentAnimal)
  const SpeciesIcon = speciesIcons[currentAnimal.species] || Cat

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
          <h1 className="text-2xl font-bold text-[#1C1917]">TNR操作记录</h1>
          <p className="text-sm text-[#78716C]">记录 {currentAnimal.name} 的TNR操作</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">动物基本信息</h2>
        <div className="flex items-center gap-4">
          <img
            src={currentAnimal.photos[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'}
            alt={currentAnimal.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-[#1C1917]">{currentAnimal.name}</h3>
              <StatusBadge status={currentAnimal.status} />
            </div>
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

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">TNR进度</h2>
        <TNRStep currentStep={tnrStep} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">选择操作步骤</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {tnrSteps.map((step) => {
              const StepIcon = step.icon
              const isCompleted = currentAnimal.tnrProgress[step.id]
              const isSelected = formData.type === step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleTypeSelect(step.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                    isSelected
                      ? 'border-[#F97316] bg-orange-50'
                      : isCompleted
                      ? 'border-green-200 bg-green-50'
                      : 'border-[#E7E5E4] hover:border-[#D6D3D1]',
                  )}
                >
                  {isCompleted && (
                    <div className="absolute right-2 top-2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  <StepIcon
                    className={cn(
                      'h-6 w-6',
                      isSelected
                        ? 'text-[#F97316]'
                        : isCompleted
                        ? 'text-green-500'
                        : 'text-[#78716C]',
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected
                        ? 'text-[#F97316]'
                        : isCompleted
                        ? 'text-green-700'
                        : 'text-[#57534E]',
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-[#A8A29E]">{step.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">操作信息</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
                <Calendar className="h-4 w-4 text-[#78716C]" />
                操作日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={cn(
                  'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                  errors.date
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
                <MapPin className="h-4 w-4 text-[#78716C]" />
                地点
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="如：XX路XX小区"
                className={cn(
                  'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                  errors.location
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
                <Syringe className="h-4 w-4 text-[#78716C]" />
                医院
              </label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                placeholder="如：XX宠物医院"
                className="w-full rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
                <User className="h-4 w-4 text-[#78716C]" />
                操作人员 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="operator"
                value={formData.operator}
                onChange={handleInputChange}
                placeholder="请填写操作人员姓名"
                className={cn(
                  'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                  errors.operator
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
              />
              {errors.operator && <p className="text-xs text-red-500">{errors.operator}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
                <DollarSign className="h-4 w-4 text-[#78716C]" />
                费用（元）
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="如：300"
                className="w-full rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
                <FileText className="h-4 w-4 text-[#78716C]" />
                备注
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="记录操作过程中的特殊情况或注意事项"
                className="w-full resize-none rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          </div>
          {errors.location && <p className="mt-2 text-xs text-red-500">{errors.location}</p>}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">照片上传</h2>
          <p className="mb-4 text-sm text-[#78716C]">
            请输入图片URL来添加{tnrTypeLabels[formData.type]}相关照片
          </p>

          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 rounded-xl border border-[#E7E5E4] p-4 md:grid-cols-12"
              >
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-medium text-[#78716C]">图片URL</label>
                  <input
                    type="url"
                    value={photo.url}
                    onChange={(e) => handlePhotoChange(index, 'url', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-medium text-[#78716C]">说明</label>
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handlePhotoChange(index, 'caption', e.target.value)}
                    placeholder="简短说明"
                    className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>
                <div className="md:col-span-2 flex items-end justify-end">
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {photo.url && (
                  <div className="md:col-span-12">
                    <div className="relative h-40 w-40 overflow-hidden rounded-lg">
                      <img
                        src={photo.url}
                        alt={photo.caption || '预览'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addPhoto}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#E7E5E4] p-4 text-sm font-medium text-[#78716C] transition-colors hover:border-[#F97316] hover:text-[#F97316]"
            >
              <Plus className="h-4 w-4" />
              添加更多照片
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/animals/${animalId}`)}
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
              <Save className="h-4 w-4" />
            )}
            保存记录
          </button>
        </div>
      </form>
    </div>
  )
}
