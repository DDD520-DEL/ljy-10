import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Image as ImageIcon,
  Cat,
  Dog,
  Bird,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  speciesLabels,
  genderLabels,
  statusLabels,
  type Species,
  type Gender,
  type AnimalStatus,
  type AnimalPhoto,
  type PhotoType,
} from '@/types'
import { cn } from '@/lib/utils'

interface FormData {
  name: string
  species: Species
  breed: string
  age: string
  gender: Gender
  foundLocation: string
  foundDate: string
  healthStatus: string
  description: string
  personality: string
  stationId: string
  status: AnimalStatus
}

interface PhotoInput {
  url: string
  type: PhotoType
  caption: string
}

const photoTypeLabels: Record<PhotoType, string> = {
  found: '发现时',
  pre_surgery: '术前',
  post_surgery: '术后',
  vaccine: '疫苗',
  release: '放归',
  adoption: '领养',
  followup: '回访',
}

const initialFormData: FormData = {
  name: '',
  species: 'cat',
  breed: '',
  age: '',
  gender: 'unknown',
  foundLocation: '',
  foundDate: new Date().toISOString().split('T')[0],
  healthStatus: '',
  description: '',
  personality: '',
  stationId: '',
  status: 'rescued',
}

const initialPhoto: PhotoInput = {
  url: '',
  type: 'found',
  caption: '',
}

export default function AnimalForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const {
    loading,
    currentAnimal,
    stations,
    fetchAnimalById,
    fetchStations,
    createAnimal,
    updateAnimal,
    clearCurrentAnimal,
  } = useAppStore()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [photos, setPhotos] = useState<PhotoInput[]>([initialPhoto])
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [step, setStep] = useState(1)
  const totalSteps = 3

  useEffect(() => {
    fetchStations()
    if (isEdit && id) {
      fetchAnimalById(id)
    }
    return () => {
      clearCurrentAnimal()
    }
  }, [isEdit, id, fetchAnimalById, fetchStations, clearCurrentAnimal])

  useEffect(() => {
    if (isEdit && currentAnimal) {
      setFormData({
        name: currentAnimal.name,
        species: currentAnimal.species,
        breed: currentAnimal.breed,
        age: currentAnimal.age,
        gender: currentAnimal.gender,
        foundLocation: currentAnimal.foundLocation,
        foundDate: currentAnimal.foundDate.split('T')[0],
        healthStatus: currentAnimal.healthStatus,
        description: currentAnimal.description,
        personality: currentAnimal.personality,
        stationId: currentAnimal.stationId,
        status: currentAnimal.status,
      })
      if (currentAnimal.photos.length > 0) {
        setPhotos(
          currentAnimal.photos.map((p: AnimalPhoto) => ({
            url: p.url,
            type: p.type,
            caption: p.caption || '',
          })),
        )
      }
    }
  }, [isEdit, currentAnimal])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入动物名称'
    }
    if (!formData.species) {
      newErrors.species = '请选择物种'
    }
    if (!formData.age.trim()) {
      newErrors.age = '请输入年龄'
    }
    if (!formData.gender) {
      newErrors.gender = '请选择性别'
    }
    if (!formData.foundLocation.trim()) {
      newErrors.foundLocation = '请输入发现位置'
    }
    if (!formData.foundDate) {
      newErrors.foundDate = '请选择发现日期'
    }
    if (!formData.healthStatus.trim()) {
      newErrors.healthStatus = '请输入健康状况'
    }
    if (!formData.stationId) {
      newErrors.stationId = '请选择所属站点'
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

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      const validPhotos = photos.filter((p) => p.url.trim())
      const animalData = {
        ...formData,
        photos: validPhotos,
      }

      if (isEdit && id) {
        await updateAnimal(id, animalData)
      } else {
        await createAnimal(animalData)
      }
      navigate('/animals')
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  if (loading && isEdit && !currentAnimal) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getSpeciesIcon = (species: Species) => {
    switch (species) {
      case 'dog':
        return Dog
      case 'cat':
        return Cat
      case 'other':
        return Bird
      default:
        return Cat
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/animals')}
          className="rounded-lg p-2 hover:bg-[#F5F5F4]"
        >
          <ArrowLeft className="h-5 w-5 text-[#57534E]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">
            {isEdit ? '编辑动物' : '新增动物'}
          </h1>
          <p className="text-sm text-[#78716C]">
            {isEdit ? '修改动物的基本信息' : '填写新救助动物的详细信息'}
          </p>
        </div>
      </div>

      {!isEdit && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                      step >= s
                        ? 'bg-[#F97316] text-white'
                        : 'bg-gray-100 text-gray-400',
                    )}
                  >
                    {s}
                  </div>
                  <p
                    className={cn(
                      'mt-2 text-xs font-medium',
                      step >= s ? 'text-[#F97316]' : 'text-gray-400',
                    )}
                  >
                    {s === 1 ? '基本信息' : s === 2 ? '详细描述' : '照片上传'}
                  </p>
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'mx-2 h-1 w-16 rounded-full transition-all duration-300',
                      step > s ? 'bg-[#F97316]' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">基本信息</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  动物名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="给它起个名字"
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  物种 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(speciesLabels) as Species[]).map((species) => {
                    const Icon = getSpeciesIcon(species)
                    return (
                      <button
                        key={species}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, species }))
                          setErrors((prev) => ({ ...prev, species: undefined }))
                        }}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                          formData.species === species
                            ? 'border-[#F97316] bg-orange-50'
                            : 'border-[#E7E5E4] hover:border-[#D6D3D1]',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-6 w-6',
                            formData.species === species ? 'text-[#F97316]' : 'text-[#78716C]',
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            formData.species === species ? 'text-[#F97316]' : 'text-[#57534E]',
                          )}
                        >
                          {speciesLabels[species]}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.species && (
                  <p className="text-xs text-red-500">{errors.species}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">品种</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="如：中华田园猫、金毛等"
                  className="w-full rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  年龄 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="如：约2岁、幼崽等"
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                    errors.age
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                  )}
                />
                {errors.age && (
                  <p className="text-xs text-red-500">{errors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  性别 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(genderLabels) as Gender[]).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, gender }))
                        setErrors((prev) => ({ ...prev, gender: undefined }))
                      }}
                      className={cn(
                        'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200',
                        formData.gender === gender
                          ? 'border-[#F97316] bg-orange-50 text-[#F97316]'
                          : 'border-[#E7E5E4] text-[#57534E] hover:border-[#D6D3D1]',
                      )}
                    >
                      {genderLabels[gender]}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-xs text-red-500">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  状态
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  发现位置 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="foundLocation"
                  value={formData.foundLocation}
                  onChange={handleInputChange}
                  placeholder="如：XX路XX小区门口"
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                    errors.foundLocation
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                  )}
                />
                {errors.foundLocation && (
                  <p className="text-xs text-red-500">{errors.foundLocation}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  发现日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="foundDate"
                  value={formData.foundDate}
                  onChange={handleInputChange}
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                    errors.foundDate
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                  )}
                />
                {errors.foundDate && (
                  <p className="text-xs text-red-500">{errors.foundDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  健康状况 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleInputChange}
                  placeholder="如：健康、轻微受伤等"
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                    errors.healthStatus
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                  )}
                />
                {errors.healthStatus && (
                  <p className="text-xs text-red-500">{errors.healthStatus}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">
                  所属站点 <span className="text-red-500">*</span>
                </label>
                <select
                  name="stationId"
                  value={formData.stationId}
                  onChange={handleInputChange}
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1',
                    errors.stationId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                  )}
                >
                  <option value="">请选择站点</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
                {errors.stationId && (
                  <p className="text-xs text-red-500">{errors.stationId}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">详细描述</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">性格描述</label>
                <textarea
                  name="personality"
                  value={formData.personality}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="描述它的性格特点，如：亲人、活泼、胆小等"
                  className="w-full resize-none rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#44403C]">详细描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="详细描述发现时的情况、特殊需求等"
                  className="w-full resize-none rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-orange-700">
                  <strong>提示：</strong>详细的描述有助于领养人更好地了解动物，提高领养成功率。
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-[#1C1917]">照片上传</h2>
            <div className="space-y-4">
              <p className="text-sm text-[#78716C]">
                请输入图片URL来添加照片（支持术前、术后、发现时等多种类型）
              </p>

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
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-[#78716C]">照片类型</label>
                    <select
                      value={photo.type}
                      onChange={(e) => handlePhotoChange(index, 'type', e.target.value as PhotoType)}
                      className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    >
                      {Object.entries(photoTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-medium text-[#78716C]">说明</label>
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => handlePhotoChange(index, 'caption', e.target.value)}
                      placeholder="简短说明"
                      className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-end">
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
                        <div className="absolute left-2 top-2">
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs">
                            {photoTypeLabels[photo.type]}
                          </span>
                        </div>
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

              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">图片上传提示</p>
                    <p className="mt-1">
                      由于是演示环境，请输入有效的图片URL地址。建议使用清晰的正面照片，
                      高质量的照片可以提高领养成功率。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {!isEdit && step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
            >
              <ArrowLeft className="h-4 w-4" />
              上一步
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/animals')}
              className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
            >
              <ArrowLeft className="h-4 w-4" />
              取消
            </button>
          )}

          <div className="flex items-center gap-3">
            {!isEdit && step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
              >
                下一步
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            ) : (
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
                {isEdit ? '保存修改' : '提交'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
