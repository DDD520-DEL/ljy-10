import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X, Clock, User, Calendar, FileText } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { transferStatusLabels } from '@/types'
import { cn } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import TransferCard from '@/components/TransferCard'

export default function TransferDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { loading, transfers, fetchTransfers, reviewTransfer } = useAppStore()
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  const transfer = transfers.find((t) => t.id === id)

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!id) return
    try {
      await reviewTransfer(id, { status, reviewNotes })
      alert(status === 'approved' ? '已同意调配' : '已拒绝调配')
      navigate('/transfer')
    } catch {
      alert('操作失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/transfer')}
            className="rounded-lg p-2 hover:bg-[#F5F5F4] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#57534E]" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#1C1917]">调配详情</h2>
            <p className="text-sm text-[#78716C]">调配记录不存在</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-12 text-center">
          <p className="text-[#78716C]">该调配记录不存在或已被删除</p>
          <button
            onClick={() => navigate('/transfer')}
            className="mt-4 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white hover:bg-[#EA580C] transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/transfer')}
          className="rounded-lg p-2 hover:bg-[#F5F5F4] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#57534E]" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[#1C1917]">调配详情</h2>
          <p className="text-sm text-[#78716C]">查看调配申请的详细信息</p>
        </div>
      </div>

      <TransferCard transfer={transfer} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white shadow-sm p-6">
          <h3 className="font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#F97316]" />
            调配详情
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[#A8A29E] mt-0.5" />
              <div>
                <p className="text-sm text-[#78716C]">申请时间</p>
                <p className="font-medium text-[#1C1917]">
                  {transfer.createdAt?.split('T')[0] || '-'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#A8A29E] mt-0.5" />
              <div>
                <p className="text-sm text-[#78716C]">当前状态</p>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium mt-1',
                  transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  transfer.status === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  transfer.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-green-100 text-green-700 border-green-200'
                )}>
                  {transferStatusLabels[transfer.status]}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-[#78716C] mb-2">调配原因</p>
              <p className="text-[#44403C] bg-[#FAFAF9] rounded-xl p-4">
                {transfer.reason}
              </p>
            </div>
          </div>
        </div>

        {transfer.status === 'pending' && (
          <div className="rounded-2xl bg-white shadow-sm p-6">
            <h3 className="font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#F97316]" />
              审核操作
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#44403C] mb-2">
                  审核意见
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="请填写审核意见..."
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-3 py-2.5 text-sm text-[#44403C] placeholder:text-[#A8A29E] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview('rejected')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                  拒绝
                </button>
                <button
                  onClick={() => handleReview('approved')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  <Check className="h-4 w-4" />
                  同意
                </button>
              </div>
            </div>
          </div>
        )}

        {(transfer.status === 'approved' || transfer.status === 'rejected' || transfer.status === 'completed') && transfer.reviewNotes && (
          <div className="rounded-2xl bg-white shadow-sm p-6">
            <h3 className="font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F97316]" />
              审核记录
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#78716C]">
                <User className="h-4 w-4" />
                <span>审核时间：{transfer.reviewedAt?.split('T')[0] || '-'}</span>
              </div>
              <p className="text-[#44403C] bg-[#FAFAF9] rounded-xl p-4">
                {transfer.reviewNotes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
