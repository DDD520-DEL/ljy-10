import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  User,
  Phone,
  Mail,
  Home,
  Heart,
  FileText,
  Calendar,
  Clock,
  Loader2,
  Cat,
  Dog,
  AlertCircle,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { applicationStatusLabels, type AdoptionApplication } from '@/types'
import { cn } from '@/lib/utils'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
}: {
  application: AdoptionApplication
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const animalPhoto = application.animal?.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'
  const statusInfo = applicationStatusLabels[application.status]
  const statusColor = statusColors[application.status]

  const handleConfirmReject = () => {
    if (rejectReason.trim()) {
      onReject(application.id, rejectReason)
      setShowRejectModal(false)
      setRejectReason('')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300">
      <div
        className="cursor-pointer p-6"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <img
            src={animalPhoto}
            alt={application.animal?.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{application.applicantName}</h3>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColor)}>
                    {statusInfo}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  申请领养：{application.animal?.name || '未知动物'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {expanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {application.applicantPhone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {application.applicantEmail}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(application.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {application.status === 'pending' && (
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onApprove(application.id)}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600"
            >
              <Check className="h-4 w-4" />
              通过
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
            >
              <X className="h-4 w-4" />
              拒绝
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          <h4 className="mb-4 text-sm font-semibold text-gray-700">申请详情</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">个人信息</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">姓名：</span>{application.applicantName}</p>
                <p><span className="text-gray-500">电话：</span>{application.applicantPhone}</p>
                <p><span className="text-gray-500">邮箱：</span>{application.applicantEmail}</p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">居住条件</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">住址：</span>{application.address}</p>
                <p><span className="text-gray-500">住房类型：</span>{application.housingType}</p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">养宠经验</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">经验：</span>{application.petExperience}</p>
                <p><span className="text-gray-500">家庭情况：</span>{application.familySituation}</p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">申请原因</span>
              </div>
              <p className="text-sm text-gray-700">{application.reason}</p>
            </div>
          </div>

          {application.reviewNotes && (
            <div className="mt-4 rounded-xl bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">审核备注</span>
              </div>
              <p className="text-sm text-gray-700">{application.reviewNotes}</p>
              {application.reviewedAt && (
                <p className="mt-2 text-xs text-gray-400">
                  审核时间：{formatDate(application.reviewedAt)}
                </p>
              )}
            </div>
          )}

          {application.documents.length > 0 && (
            <div className="mt-4 rounded-xl bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">证明材料</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {application.documents.map((doc, index) => (
                  <span key={index} className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600">
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">拒绝申请</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">请填写拒绝原因：</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="请详细说明拒绝该申请的原因..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdoptionReview() {
  const navigate = useNavigate()
  const { applications, loading, fetchApplications, reviewApplication } = useAppStore()
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleApprove = async (id: string) => {
    try {
      await reviewApplication(id, { status: 'approved', reviewNotes: '审核通过' })
      await fetchApplications()
      navigate(`/adoption/agreement/${id}`)
    } catch (error) {
      console.error('审核失败:', error)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      await reviewApplication(id, { status: 'rejected', reviewNotes: reason })
      await fetchApplications()
    } catch (error) {
      console.error('拒绝失败:', error)
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true
    return app.status === filterStatus
  })

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">领养审核</h1>
          <p className="mt-2 text-gray-600">管理和审核领养申请</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待审核' },
            { value: 'approved', label: '已通过' },
            { value: 'rejected', label: '已拒绝' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value as typeof filterStatus)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                filterStatus === option.value
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              {option.label}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  filterStatus === option.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {statusCounts[option.value as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white py-16 text-center">
            <Clock className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-600">暂无申请记录</h3>
            <p className="mt-2 text-sm text-gray-400">等待新的领养申请</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
