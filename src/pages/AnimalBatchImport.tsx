import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import { animalApi } from '@/services/api'
import {
  speciesLabels,
  genderLabels,
  type Species,
  type Gender,
  type BatchImportPreviewItem,
  type BatchAnimalImportItem,
  type BatchImportResult,
} from '@/types'
import { cn } from '@/lib/utils'

type ImportStep = 'upload' | 'preview' | 'result'

interface EditModalProps {
  item: BatchImportPreviewItem
  stations: { id: string; name: string }[]
  onSave: (item: BatchImportPreviewItem) => void
  onClose: () => void
}

function EditModal({ item, stations, onSave, onClose }: EditModalProps) {
  const [formData, setFormData] = useState<BatchAnimalImportItem>({
    name: item.name,
    species: item.species,
    breed: item.breed,
    age: item.age,
    gender: item.gender,
    foundLocation: item.foundLocation,
    foundDate: item.foundDate ? item.foundDate.split('T')[0] : '',
    healthStatus: item.healthStatus,
    description: item.description,
    personality: item.personality,
    stationId: item.stationId,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '名称不能为空'
    if (!formData.age.trim()) newErrors.age = '年龄不能为空'
    if (!formData.foundLocation.trim()) newErrors.foundLocation = '发现位置不能为空'
    if (!formData.foundDate) newErrors.foundDate = '发现日期不能为空'
    if (!formData.healthStatus.trim()) newErrors.healthStatus = '健康状况不能为空'
    if (!formData.stationId) newErrors.stationId = '请选择站点'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const updated: BatchImportPreviewItem = {
      ...item,
      ...formData,
      errors: [],
      valid: true,
    }
    onSave(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#E7E5E4] bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-[#1C1917]">
            编辑第 {item.rowIndex} 行数据
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#78716C] hover:bg-[#F5F5F4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403C]">
                动物名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403C]">
                物种 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.species}
                onChange={(e) =>
                  setFormData({ ...formData, species: e.target.value as Species })
                }
                className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              >
                {Object.entries(speciesLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403C]">品种</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                placeholder="如：中华田园猫、金毛等"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403C]">
                年龄 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                  errors.age
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
                placeholder="如：约2岁、幼崽等"
              />
              {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403C]">
                性别 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as Gender })
                }
                className="w-full rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              >
                {Object.entries(genderLabels).map(([value, label]) => (
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
                value={formData.foundLocation}
                onChange={(e) =>
                  setFormData({ ...formData, foundLocation: e.target.value })
                }
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                  errors.foundLocation
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
                placeholder="如：XX路XX小区门口"
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
                value={formData.foundDate}
                onChange={(e) => setFormData({ ...formData, foundDate: e.target.value })}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
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
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                  errors.healthStatus
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
                placeholder="如：健康、轻微受伤等"
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
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
                  errors.stationId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#E7E5E4] focus:border-[#F97316] focus:ring-[#F97316]',
                )}
              >
                <option value="">请选择站点</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.stationId && (
                <p className="text-xs text-red-500">{errors.stationId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403C]">性格描述</label>
            <textarea
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              placeholder="描述它的性格特点"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403C]">详细描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#E7E5E4] px-3 py-2 text-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              placeholder="详细描述发现时的情况、特殊需求等"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#E7E5E4] bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E7E5E4] bg-white px-5 py-2 text-sm font-medium text-[#44403C] hover:bg-[#F5F5F4]"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#F97316] px-5 py-2 text-sm font-medium text-white hover:bg-[#EA580C]"
          >
            <Check className="h-4 w-4" />
            保存修改
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AnimalBatchImport() {
  const navigate = useNavigate()
  const { loading, stations, batchImportAnimals, fetchStations, fetchAnimals } = useAppStore()

  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [previewItems, setPreviewItems] = useState<BatchImportPreviewItem[]>([])
  const [validCount, setValidCount] = useState(0)
  const [invalidCount, setInvalidCount] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [editingItem, setEditingItem] = useState<BatchImportPreviewItem | null>(null)
  const [importResult, setImportResult] = useState<BatchImportResult | null>(null)
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid'>('all')
  const [isProcessing, setIsProcessing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  const speciesMap: Record<string, Species> = {
    '狗狗': 'dog',
    '狗': 'dog',
    dog: 'dog',
    '猫咪': 'cat',
    '猫': 'cat',
    cat: 'cat',
    '其他': 'other',
    other: 'other',
  }

  const genderMap: Record<string, Gender> = {
    '公': 'male',
    '雄': 'male',
    male: 'male',
    '母': 'female',
    '雌': 'female',
    female: 'female',
    '未知': 'unknown',
    unknown: 'unknown',
  }

  const stationIdMap: Record<string, string> = {}
  stations.forEach((s) => {
    stationIdMap[s.name] = s.id
    stationIdMap[s.id] = s.id
  })

  const normalizeValue = (raw: any): string => {
    if (raw === null || raw === undefined) return ''
    return String(raw).trim()
  }

  const parseFile = useCallback(
    async (selectedFile: File) => {
      setIsProcessing(true)
      try {
        const buffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

        const importItems: BatchAnimalImportItem[] = jsonData.map((row: any) => {
          const rawSpecies = normalizeValue(row['物种'] || row['species'] || 'cat')
          const rawGender = normalizeValue(row['性别'] || row['gender'] || 'unknown')
          const rawStation = normalizeValue(
            row['所属站点'] || row['站点'] || row['stationId'] || row['station'] || '',
          )
          const rawFoundDate = normalizeValue(
            row['发现日期'] || row['foundDate'] || new Date().toISOString().split('T')[0],
          )

          let foundDate = rawFoundDate
          if (rawFoundDate && !rawFoundDate.includes('T')) {
            const parsed = XLSX.SSF.parse_date_code(parseFloat(rawFoundDate))
            if (parsed) {
              const y = String(parsed.y).padStart(4, '0')
              const m = String(parsed.m).padStart(2, '0')
              const d = String(parsed.d).padStart(2, '0')
              foundDate = `${y}-${m}-${d}`
            }
          }

          return {
            name: normalizeValue(row['名称'] || row['名字'] || row['name']),
            species: speciesMap[rawSpecies] || (rawSpecies as Species),
            breed: normalizeValue(row['品种'] || row['breed']) || '未知',
            age: normalizeValue(row['年龄'] || row['age']),
            gender: genderMap[rawGender] || (rawGender as Gender),
            foundLocation: normalizeValue(row['发现位置'] || row['地点'] || row['foundLocation']),
            foundDate,
            healthStatus: normalizeValue(row['健康状况'] || row['健康'] || row['healthStatus']) || '健康',
            description: normalizeValue(row['描述'] || row['description']),
            personality: normalizeValue(row['性格'] || row['personality']),
            stationId: stationIdMap[rawStation] || rawStation,
            photos: [],
          }
        })

        const result = await animalApi.batchPreview(importItems)
        if (result.success && result.data) {
          setPreviewItems(result.data.items)
          setValidCount(result.data.validCount)
          setInvalidCount(result.data.invalidCount)
          setStep('preview')
        }
      } catch (err) {
        console.error('解析文件失败:', err)
        alert('文件解析失败，请检查文件格式是否正确')
      } finally {
        setIsProcessing(false)
      }
    },
    [stationIdMap],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileNameLower = selectedFile.name.toLowerCase()
    const isValid = validExtensions.some((ext) => fileNameLower.endsWith(ext))

    if (!isValid) {
      alert('请上传 Excel (.xlsx, .xls) 或 CSV (.csv) 格式的文件')
      return
    }

    setFile(selectedFile)
    setFileName(selectedFile.name)
    parseFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileNameLower = droppedFile.name.toLowerCase()
    const isValid = validExtensions.some((ext) => fileNameLower.endsWith(ext))

    if (!isValid) {
      alert('请上传 Excel (.xlsx, .xls) 或 CSV (.csv) 格式的文件')
      return
    }

    setFile(droppedFile)
    setFileName(droppedFile.name)
    parseFile(droppedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleEditSave = (updated: BatchImportPreviewItem) => {
    setPreviewItems((prev) => {
      const newItems = prev.map((item) =>
        item.rowIndex === updated.rowIndex ? updated : item,
      )
      const count = newItems.filter((i) => i.valid).length
      setValidCount(count)
      setInvalidCount(newItems.length - count)
      return newItems
    })
    setEditingItem(null)
  }

  const toggleRow = (index: number) => {
    const newSet = new Set(expandedRows)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setExpandedRows(newSet)
  }

  const removeRow = (rowIndex: number) => {
    const filtered = previewItems.filter((i) => i.rowIndex !== rowIndex)
    setPreviewItems(filtered)
    setValidCount(filtered.filter((i) => i.valid).length)
    setInvalidCount(filtered.filter((i) => !i.valid).length)
  }

  const handleConfirmImport = async () => {
    if (validCount === 0) {
      alert('没有可导入的有效数据，请修正后重试')
      return
    }

    const validItems = previewItems.filter((i) => i.valid).map(({ valid, errors, rowIndex, ...rest }) => rest)
    setIsProcessing(true)

    try {
      const result = await batchImportAnimals(validItems)
      if (result) {
        setImportResult(result)
        setStep('result')
        fetchAnimals()
      }
    } catch (err) {
      console.error('导入失败:', err)
      alert('导入失败，请稍后重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        '名称': '小花',
        '物种': '猫咪',
        '品种': '中华田园猫',
        '年龄': '约2岁',
        '性别': '母',
        '发现位置': '朝阳区XX路XX小区门口',
        '发现日期': '2024-01-15',
        '健康状况': '健康',
        '性格': '亲人、活泼、爱撒娇',
        '描述': '发现时在小区流浪，性格温顺，已做基础体检',
        '所属站点': stations[0]?.name || '总站',
      },
      {
        '名称': '大黄',
        '物种': '狗狗',
        '品种': '金毛',
        '年龄': '约3岁',
        '性别': '公',
        '发现位置': '海淀区XX公园',
        '发现日期': '2024-01-20',
        '健康状况': '轻微皮肤病',
        '性格': '友善、乖巧、喜欢散步',
        '描述': '在公园附近流浪多日，已进行初步治疗',
        '所属站点': stations[0]?.name || '总站',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '流浪动物导入模板')
    XLSX.writeFile(workbook, '流浪动物批量导入模板.xlsx')
  }

  const filteredItems = previewItems.filter((item) => {
    if (filterMode === 'valid') return item.valid
    if (filterMode === 'invalid') return !item.valid
    return true
  })

  if (isProcessing && step === 'upload') {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-[#78716C]">正在解析文件...</p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-[#1C1917]">批量导入流浪动物</h1>
          <p className="text-sm text-[#78716C]">通过上传 Excel 或 CSV 文件批量登记流浪动物</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-center gap-4">
          {['上传文件', '预览确认', '导入完成'].map((label, index) => {
            const s = index + 1
            const isActive =
              (step === 'upload' && s === 1) ||
              (step === 'preview' && s === 2) ||
              (step === 'result' && s === 3)
            const isDone =
              (step === 'preview' && s < 2) ||
              (step === 'result' && s < 3)

            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                      isActive
                        ? 'bg-[#F97316] text-white'
                        : isDone
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400',
                    )}
                  >
                    {isDone ? <Check className="h-5 w-5" /> : s}
                  </div>
                  <p
                    className={cn(
                      'mt-2 text-xs font-medium',
                      isActive
                        ? 'text-[#F97316]'
                        : isDone
                          ? 'text-green-600'
                          : 'text-gray-400',
                    )}
                  >
                    {label}
                  </p>
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'mx-2 h-1 w-20 rounded-full transition-all duration-300',
                      isDone ? 'bg-green-500' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {step === 'upload' && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-[#D6D3D1] bg-white p-12 text-center transition-all duration-200 hover:border-[#F97316] hover:bg-orange-50/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Upload className="h-8 w-8 text-[#F97316]" />
            </div>
            <p className="text-lg font-semibold text-[#1C1917]">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="mt-2 text-sm text-[#78716C]">
              支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式
            </p>
            {fileName && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
                <FileSpreadsheet className="h-4 w-4" />
                {fileName}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1C1917]">下载导入模板</h3>
                <p className="mt-2 text-sm text-[#78716C]">
                  请先下载模板文件，按照模板格式填写数据后再上传
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                <Download className="h-4 w-4" />
                下载模板
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-[#FAFAF9] p-4">
              <h4 className="text-sm font-semibold text-[#44403C] mb-3">字段说明</h4>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>名称</strong>：动物名称（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>物种</strong>：猫咪 / 狗狗 / 其他（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span></span>
                  <span>
                    <strong>品种</strong>：如中华田园猫、金毛等（选填，默认未知）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>年龄</strong>：如约2岁、幼崽等（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>性别</strong>：公 / 母 / 未知（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>发现位置</strong>：详细地址（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>发现日期</strong>：YYYY-MM-DD 格式（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>健康状况</strong>：如健康、轻微受伤等（必填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span></span>
                  <span>
                    <strong>性格</strong>：性格描述（选填）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span></span>
                  <span>
                    <strong>描述</strong>：详细描述（选填）
                  </span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <span className="text-red-500">*</span>
                  <span>
                    <strong>所属站点</strong>：站点名称或ID（必填，需与系统中的站点一致）
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总计</p>
                  <p className="text-2xl font-bold text-gray-900">{previewItems.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">有效数据</p>
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-2.5">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">待修正</p>
                  <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#44403C]">筛选：</span>
                {(['all', 'valid', 'invalid'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      filterMode === mode
                        ? 'bg-[#F97316] text-white'
                        : 'bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4]',
                    )}
                  >
                    {mode === 'all' ? `全部 (${previewItems.length})` : mode === 'valid' ? `有效 (${validCount})` : `待修正 (${invalidCount})`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setStep('upload')
                  setPreviewItems([])
                  setFile(null)
                  setFileName('')
                }}
                className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#44403C] hover:bg-[#F5F5F4]"
              >
                <Upload className="h-4 w-4" />
                重新上传
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="px-4 py-3 text-left w-12"></th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E] w-16">行号</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">状态</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">名称</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">物种</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">品种</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">年龄</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">性别</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">发现位置</th>
                    <th className="px-4 py-3 text-left font-medium text-[#57534E]">所属站点</th>
                    <th className="px-4 py-3 text-center font-medium text-[#57534E] w-32">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredItems.flatMap((item) => [
                      <tr
                        key={`row-${item.rowIndex}`}
                        className={cn(
                          'transition-colors hover:bg-[#FAFAF9]',
                          !item.valid && 'bg-red-50/30',
                        )}
                      >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleRow(item.rowIndex)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100"
                            >
                              {expandedRows.has(item.rowIndex) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#78716C]">
                            #{item.rowIndex}
                          </td>
                          <td className="px-4 py-3">
                            {item.valid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                <CheckCircle2 className="h-3 w-3" />
                                有效
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                <AlertCircle className="h-3 w-3" />
                                待修正
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#1C1917]">{item.name}</td>
                          <td className="px-4 py-3 text-[#57534E]">
                            {speciesLabels[item.species as Species] || item.species}
                          </td>
                          <td className="px-4 py-3 text-[#57534E]">{item.breed}</td>
                          <td className="px-4 py-3 text-[#57534E]">{item.age}</td>
                          <td className="px-4 py-3 text-[#57534E]">
                            {genderLabels[item.gender as Gender] || item.gender}
                          </td>
                          <td className="px-4 py-3 text-[#57534E] max-w-[200px] truncate">
                            {item.foundLocation}
                          </td>
                          <td className="px-4 py-3 text-[#57534E]">
                            {stations.find((s) => s.id === item.stationId)?.name ||
                              item.stationId}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="rounded-lg p-1.5 text-[#78716C] hover:bg-blue-50 hover:text-blue-600"
                                title="编辑"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeRow(item.rowIndex)}
                                className="rounded-lg p-1.5 text-[#78716C] hover:bg-red-50 hover:text-red-600"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>,
                        expandedRows.has(item.rowIndex) && (
                          <tr key={`detail-${item.rowIndex}`}>
                            <td colSpan={2}></td>
                            <td colSpan={9} className="px-4 py-4 bg-[#FAFAF9]">
                              <div className="space-y-2">
                                {item.errors.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-red-600 mb-1">错误信息：</p>
                                    <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5 pl-2">
                                      {item.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-xs">
                                  <div>
                                    <span className="text-[#A8A29E]">发现日期：</span>
                                    <span className="text-[#44403C]">{item.foundDate}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#A8A29E]">健康状况：</span>
                                    <span className="text-[#44403C]">{item.healthStatus}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-[#A8A29E]">性格：</span>
                                    <span className="text-[#44403C]">{item.personality || '无'}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-[#A8A29E]">描述：</span>
                                    <span className="text-[#44403C]">{item.description || '无'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ),
                      ]).filter(Boolean)
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/animals')}
              className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] hover:bg-[#F5F5F4]"
            >
              <ArrowLeft className="h-4 w-4" />
              取消
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setStep('upload')
                  setPreviewItems([])
                  setFile(null)
                  setFileName('')
                }}
                className="rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] hover:bg-[#F5F5F4]"
              >
                重新上传
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={validCount === 0 || isProcessing}
                className="flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                确认导入 {validCount} 条
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'result' && importResult && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1C1917]">导入完成！</h2>
            <p className="mt-2 text-sm text-[#78716C]">
              成功导入 {importResult.importedCount} 条流浪动物记录
              {importResult.failedCount > 0 && `，${importResult.failedCount} 条失败`}
            </p>
          </div>

          {importResult.failedCount > 0 && importResult.errors.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                失败记录 ({importResult.failedCount}条)
              </h3>
              <div className="space-y-2">
                {importResult.errors.map((err, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <p className="text-sm font-medium text-red-700">
                      第 {err.rowIndex} 行：
                    </p>
                    <ul className="mt-1 list-disc list-inside text-xs text-red-600 space-y-0.5">
                      {err.errors.map((e, j) => (
                        <li key={j}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {importResult.importedAnimals.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                已导入动物 ({importResult.importedCount}只)
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {importResult.importedAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => navigate(`/animals/${animal.id}`)}
                    className="cursor-pointer rounded-xl border border-[#E7E5E4] p-4 transition-all duration-200 hover:border-[#F97316] hover:bg-orange-50/30"
                  >
                    <p className="font-medium text-[#1C1917]">{animal.name}</p>
                    <p className="mt-1 text-xs text-[#78716C]">
                      {speciesLabels[animal.species as Species]} · {animal.breed} · {animal.age}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setStep('upload')
                setPreviewItems([])
                setFile(null)
                setFileName('')
                setImportResult(null)
              }}
              className="rounded-lg border border-[#E7E5E4] bg-white px-6 py-2.5 text-sm font-medium text-[#44403C] hover:bg-[#F5F5F4]"
            >
              继续导入
            </button>
            <button
              onClick={() => navigate('/animals')}
              className="flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#EA580C]"
            >
              查看动物列表
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          stations={stations.map((s) => ({ id: s.id, name: s.name }))}
          onSave={handleEditSave}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}
