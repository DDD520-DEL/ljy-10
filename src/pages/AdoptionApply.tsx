import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Home, Heart, FileText, Upload, Check, ArrowRight, ArrowLeft, Loader2, Cat, Dog, Calendar, Mars, Venus } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { speciesLabels, genderLabels } from '@/types'
import { cn } from '@/lib/utils'

interface FormData {
  applicantName: string
  applicantPhone: string
  applicantEmail: string
  address: string
  housingType: string
  petExperience: string
  familySituation: string
  reason: string
  documents: string[]
}

const steps = [
  { id: 1, title: '个人信息', icon: User },
  { id: 2, title: '居住条件', icon: Home },
  { id: 3, title: '养宠经验', icon: Heart },
  { id: 4, title: '申请原因', icon: FileText },
]

const housingOptions = ['公寓', '独栋别墅', '联排别墅', '平房', '其他']
const experienceOptions = ['从未养过宠物', '养过宠物但现在没有', '目前养有宠物', '有丰富养宠经验']

export default function AdoptionApply() {
  const { animalId } = useParams<{ animalId: string }>()
  const navigate = useNavigate()
  const { currentAnimal, loading, fetchAnimalById, createApplication } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    address: '',
    housingType: '',
    petExperience: '',
    familySituation: '',
    reason: '',
    documents: [],
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (animalId) {
      fetchAnimalById(animalId)
    }
  }, [animalId, fetchAnimalById])

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 1) {
      if (!formData.applicantName.trim()) newErrors.applicantName = '请输入姓名'
      if (!formData.applicantPhone.trim()) {
        newErrors.applicantPhone = '请输入电话号码'
      } else if (!/^1[3-9]\d{9}$/.test(formData.applicantPhone)) {
        newErrors.applicantPhone = '请输入有效的手机号码'
      }
      if (!formData.applicantEmail.trim()) {
        newErrors.applicantEmail = '请输入邮箱'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicantEmail)) {
        newErrors.applicantEmail = '请输入有效的邮箱地址'
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = '请输入详细住址'
      if (!formData.housingType) newErrors.housingType = '请选择住房类型'
    }

    if (step === 3) {
      if (!formData.petExperience) newErrors.petExperience = '请选择养宠经验'
      if (!formData.familySituation.trim()) newErrors.familySituation = '请描述家庭情况'
    }

    if (step === 4) {
      if (!formData.reason.trim()) newErrors.reason = '请填写领养原因'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = () => {
    const mockFileName = `证明材料_${Date.now()}.pdf`
    setFormData({
      ...formData,
      documents: [...formData.documents, mockFileName],
    })
  }

  const handleRemoveFile = (fileName: string) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((d) => d !== fileName),
    })
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep) && animalId) {
      try {
        await createApplication({
          animalId,
          ...formData,
        })
        setSubmitted(true)
        setTimeout(() => {
          navigate('/adoption/center')
        }, 3000)
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const photoUrl = currentAnimal?.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">申请提交成功！</h2>
          <p className="mt-2 text-gray-600">我们会尽快审核您的领养申请，请耐心等待</p>
          <p className="mt-4 text-sm text-gray-400">3秒后返回领养中心...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">领养申请</h1>

        {currentAnimal && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">申请领养的动物</h3>
            <div className="flex items-center gap-4">
              <img
                src={photoUrl}
                alt={currentAnimal.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{currentAnimal.name}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    {currentAnimal.species === 'dog' ? <Dog className="h-4 w-4" /> : <Cat className="h-4 w-4" />}
                    {speciesLabels[currentAnimal.species]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {currentAnimal.age}
                  </span>
                  <span className="flex items-center gap-1">
                    {currentAnimal.gender === 'male' ? <Mars className="h-4 w-4 text-blue-400" /> : <Venus className="h-4 w-4 text-pink-400" />}
                    {genderLabels[currentAnimal.gender]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                    currentStep > step.id
                      ? 'border-green-500 bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'border-green-500 bg-white text-green-500'
                      : 'border-gray-200 bg-white text-gray-400'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    currentStep >= step.id ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-6 h-0.5 w-full',
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    )}
                    style={{ left: '50%', width: 'calc(100% - 3rem)' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">个人信息</h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">申请人姓名 *</label>
                    <input
                      type="text"
                      value={formData.applicantName}
                      onChange={(e) => handleInputChange('applicantName', e.target.value)}
                      className={cn(
                        'w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2',
                        errors.applicantName
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                      )}
                      placeholder="请输入您的真实姓名"
                    />
                    {errors.applicantName && <p className="mt-1 text-sm text-red-500">{errors.applicantName}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">联系电话 *</label>
                    <input
                      type="tel"
                      value={formData.applicantPhone}
                      onChange={(e) => handleInputChange('applicantPhone', e.target.value)}
                      className={cn(
                        'w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2',
                        errors.applicantPhone
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                      )}
                      placeholder="请输入您的手机号码"
                    />
                    {errors.applicantPhone && <p className="mt-1 text-sm text-red-500">{errors.applicantPhone}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">电子邮箱 *</label>
                    <input
                      type="email"
                      value={formData.applicantEmail}
                      onChange={(e) => handleInputChange('applicantEmail', e.target.value)}
                      className={cn(
                        'w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2',
                        errors.applicantEmail
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                      )}
                      placeholder="请输入您的邮箱地址"
                    />
                    {errors.applicantEmail && <p className="mt-1 text-sm text-red-500">{errors.applicantEmail}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">居住条件</h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">详细住址 *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={cn(
                        'w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2',
                        errors.address
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                      )}
                      placeholder="请输入您的详细住址"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">住房类型 *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {housingOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange('housingType', option)}
                          className={cn(
                            'rounded-xl border-2 p-4 text-left transition-all duration-200',
                            formData.housingType === option
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          )}
                        >
                          <span className={formData.housingType === option ? 'font-medium text-green-700' : 'text-gray-700'}>
                            {option}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.housingType && <p className="mt-1 text-sm text-red-500">{errors.housingType}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">养宠经验</h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">养宠经验 *</label>
                    <div className="space-y-3">
                      {experienceOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange('petExperience', option)}
                          className={cn(
                            'w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
                            formData.petExperience === option
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          )}
                        >
                          <span className={formData.petExperience === option ? 'font-medium text-green-700' : 'text-gray-700'}>
                            {option}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.petExperience && <p className="mt-1 text-sm text-red-500">{errors.petExperience}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">家庭情况 *</label>
                    <textarea
                      value={formData.familySituation}
                      onChange={(e) => handleInputChange('familySituation', e.target.value)}
                      rows={4}
                      className={cn(
                        'w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2',
                        errors.familySituation
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                      )}
                      placeholder="请描述您的家庭成员、是否有过敏史、家中是否有其他宠物等情况"
                    />
                    {errors.familySituation && <p className="mt-1 text-sm text-red-500">{errors.familySituation}</p>}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">申请原因</h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">领养原因 *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      rows={5}
                      className={cn(
                        'w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2',
                        errors.reason
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-100'
                      )}
                      placeholder="请详细描述您想要领养这只动物的原因，以及您将如何照顾它"
                    />
                    {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">证明材料（可选）</label>
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">点击上传相关证明材料</p>
                      <button
                        onClick={handleFileUpload}
                        className="mt-3 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        模拟上传
                      </button>
                    </div>
                    {formData.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.documents.map((doc) => (
                          <div key={doc} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{doc}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(doc)}
                              className="text-sm text-red-500 hover:text-red-600"
                            >
                              删除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200',
                    currentStep === 1
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <ArrowLeft className="h-5 w-5" />
                  上一步
                </button>
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-700"
                  >
                    下一步
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        提交申请
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
