import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Plus,
  X,
  Image as ImageIcon,
  Heart,
  FileText,
  AlertCircle,
  Check,
  Cat,
  Dog,
  Bird,
  Calendar,
  User,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  periodLabels,
  speciesLabels,
  genderLabels,
  type Followup,
} from '@/types'
import { cn } from '@/lib/utils'
import { followupApi } from '@/services/api'

interface FormData {
  healthStatus: string
  description: string
  issues: string
  photos: string[]
}

interface PhotoInput {
  url: string
}

const healthOptions = [
  { value: 'excellent', label: '非常好', icon: Heart, color: 'text-green-500' },
  { value: 'good', label: '良好', icon: Heart, color: 'text-blue-500' },
  { value: 'fair', label: '一般', icon: Heart, color: 'text-yellow-500' },
  { value: 'poor', label: '较差', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'bad', label: '很差', icon: AlertCircle, color: 'text-red-500' },
]

const initialFormData: FormData = {
  healthStatus: '',
  description: '',
  issues: '',
  photos: [],
}

const initialPhoto: PhotoInput = {
  url: '',
}

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  other: Bird,
}

export default function FollowupSubmit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { loading, submitFollowup, currentUser, fetchCurrentUser } = useAppStore()
  const [followup, setFollowup] = useState<Followup | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [photos, setPhotos] = useState<PhotoInput[]>([initialPhoto])
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    const fetchFollowup = async () => {
      if (id) {
        try {
          setFetchLoading(true)
          const res = await followupApi.getById(id)
          if (res.success && res.data) {
            setFollowup(res.data)
          }
        } catch (error) {
          console.error('获取回访信息失败:', error)
        } finally {
          setFetchLoading(false)
        }
      }
    }
    fetchFollowup()
  }, [id])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.healthStatus) {
      newErrors.healthStatus = '请选择健康状况'
    }
    if (!formData.description.trim()) {
      newErrors.description = '请填写生活描述'
    }

    const validPhotos = photos.filter((p) => p.url.trim())
    if (validPhotos.length === 0) {
      newErrors.photos = '请至少上传1张近照'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleHealthSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, healthStatus: value }))
    if (errors.healthStatus) {
      setErrors((prev) => ({ ...prev, healthStatus: undefined }))
    }
  }

  const handlePhotoChange = (index: number, value: string) => {
    setPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, url: value } : photo)),
    )
    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: undefined }))
    }
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

    if (!validate() || !id) {
      return
    }

    try {
      const validPhotos = photos.filter((p) => p.url.trim()).map((p) => p.url)

      const submitData = {
        ...formData,
        photos: validPhotos,
      }

      await submitFollowup(id, submitData)
      setSubmitted(true)
      setTimeout(() => {
        navigate('/followup/calendar')
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
          <h2 className="mt-6 text-2xl font-bold text-[#1C1917]">提交成功！</h2>
          <p className="mt-2 text-[#78716C]">回访记录已保存，等待工作人员审核</p>
          <p className="mt-4 text-sm text-[#A8A29E]">2秒后返回回访日历...</p>
        </div>
      </div>
    )
  }

  if (fetchLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!followup) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center">
        <p className="text-gray-500">未找到该回访记录</p>
        <button
          onClick={() => navigate('/followup/calendar')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回日历
        </button>
      </div>
    )
  }

  const animal = followup.animal
  const SpeciesIcon = animal ? speciesIcons[animal.species] || Cat : Cat

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/followup/calendar')}
          className="rounded-lg p-2 hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-5 w-5 text-[#57534E]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">提交回访</h1>
          <p className="text-sm text-[#78716C]">
            {periodLabels[followup.period]}回访记录
          </p>
        </div>
      </div>

      {animal && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">动物信息</h2>
          <div className="flex items-center gap-4">
            <img
              src={animal.photos[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'}
              alt={animal.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#1C1917]">{animal.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#78716C]">
                <span className="flex items-center gap-1">
                  <SpeciesIcon className="h-4 w-4" />
                  {speciesLabels[animal.species]}
                </span>
                <span className="text-[#D6D3D1]">·</span>
                <span>{animal.breed || '未知品种'}</span>
                <span className="text-[#D6D3D1]">·</span>
                <span>{genderLabels[animal.gender]}</span>
                <span className="text-[#D6D3D1]">·</span>
                <span>{animal.age}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/80">回访周期</p>
            <p className="text-xl font-bold">{periodLabels[followup.period]}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-white/80">预约日期</p>
            <p className="text-lg font-semibold">
              {new Date(followup.scheduledDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 pt-4 border-t border-white/20">
          <User className="h-4 w-4" />
          <span className="text-sm">领养人：{followup.adopterName}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">健康状况</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {healthOptions.map((option) => {
              const OptionIcon = option.icon
              const isSelected = formData.healthStatus === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleHealthSelect(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                    isSelected
                      ? 'border-[#F97316] bg-orange-50'
                      : 'border-[#E7E5E4] hover:border-[#D6D3D1]',
                  )}
                >
                  <OptionIcon className={cn('h-6 w-6', option.color)} />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-[#F97316]' : 'text-[#57534E]',
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
          {errors.healthStatus && (
            <p className="mt-2 text-xs text-red-500">{errors.healthStatus}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">生活描述</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
              <FileText className="h-4 w-4 text-[#78716C]" />
              描述它的日常生活 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="描述它的饮食习惯、活动情况、精神状态等"
              className={cn(
                'w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
              )}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">问题反馈</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#44403C]">
              <AlertCircle className="h-4 w-4 text-[#78716C]" />
              遇到的问题或需要的帮助
            </label>
            <textarea
              name="issues"
              value={formData.issues}
              onChange={handleInputChange}
              rows={3}
              placeholder="如：食欲不振、行为异常、需要咨询等（选填）"
              className="w-full resize-none rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1C1917]">近照上传</h2>
          <p className="mb-4 text-sm text-[#78716C]">
            请输入图片URL来添加近期照片 <span className="text-red-500">*</span>（至少1张）
          </p>

          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 rounded-xl border border-[#E7E5E4] p-4 md:grid-cols-12"
              >
                <div className="md:col-span-9 space-y-2">
                  <label className="text-xs font-medium text-[#78716C]">图片URL</label>
                  <input
                    type="url"
                    value={photo.url}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                      errors.photos
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                    )}
                  />
                </div>
                <div className="md:col-span-3 flex items-end justify-end">
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
                        alt="预览"
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

            {errors.photos && (
              <p className="text-xs text-red-500">{errors.photos}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/followup/calendar')}
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
            提交回访
          </button>
        </div>
      </form>
    </div>
  )
}
