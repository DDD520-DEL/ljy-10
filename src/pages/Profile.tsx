import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, Building2, Calendar, Clock, AlertCircle, CheckCircle, Eye, Send, PawPrint, User } from 'lucide-react'
import { userApi } from '@/services/api'
import { useAppStore } from '@/stores/appStore'
import { roleLabels, followupStatusLabels, type User as UserType, type AdoptionApplication, type Followup } from '@/types'
import { cn } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

const followupStatusColors: Record<Followup['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-gray-100 text-gray-700 border-gray-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
}

interface AdoptionWithFollowups extends AdoptionApplication {
  nextFollowup?: Followup
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#FAFAF9] p-3">
      <div className="rounded-lg bg-[#F97316]/10 p-2">
        <Icon className="h-5 w-5 text-[#F97316]" />
      </div>
      <div>
        <p className="text-xs text-[#78716C]">{label}</p>
        <p className="font-medium text-[#1C1917]">{value}</p>
      </div>
    </div>
  )
}

function AdoptionCard({ adoption, onSubmitFollowup, onViewDetail }: { 
  adoption: AdoptionWithFollowups
  onSubmitFollowup: (id: string) => void
  onViewDetail: (id: string) => void
}) {
  const isOverdue = adoption.nextFollowup?.status === 'overdue'
  const photoUrl = adoption.animal?.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square'

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-48 sm:h-auto relative">
          <img
            src={photoUrl}
            alt={adoption.animal?.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-white font-semibold">{adoption.animal?.name}</p>
          </div>
        </div>
        <div className="flex-1 p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#57534E]">
              <Calendar className="h-4 w-4 text-[#A8A29E]" />
              <span>领养日期：{adoption.createdAt?.split('T')[0] || '-'}</span>
            </div>
            {adoption.nextFollowup && (
              <div className={cn(
                'flex items-center gap-2 text-sm',
                isOverdue ? 'text-red-600' : 'text-[#57534E]'
              )}>
                <Clock className={cn('h-4 w-4', isOverdue ? 'text-red-500' : 'text-[#A8A29E]')} />
                <span>下次回访：{adoption.nextFollowup.scheduledDate?.split('T')[0] || '-'}</span>
                {isOverdue && <AlertCircle className="h-4 w-4" />}
              </div>
            )}
          </div>

          {adoption.nextFollowup && (
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                followupStatusColors[adoption.nextFollowup.status]
              )}>
                {adoption.nextFollowup.status === 'overdue' && <AlertCircle className="h-3 w-3" />}
                {followupStatusLabels[adoption.nextFollowup.status]}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {adoption.nextFollowup && adoption.nextFollowup.status !== 'approved' && (
              <button
                onClick={() => onSubmitFollowup(adoption.nextFollowup!.id)}
                className="flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
              >
                <Send className="h-4 w-4" />
                提交回访
              </button>
            )}
            <button
              onClick={() => onViewDetail(adoption.animalId)}
              className="flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
            >
              <Eye className="h-4 w-4" />
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FollowupTaskCard({ followup, onSubmit, onView }: {
  followup: Followup
  onSubmit: (id: string) => void
  onView: (id: string) => void
}) {
  const isOverdue = followup.status === 'overdue'
  const today = new Date()
  const scheduled = new Date(followup.scheduledDate)
  const daysDiff = Math.ceil((scheduled.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all duration-200 hover:shadow-md',
      isOverdue ? 'border-red-200 bg-red-50/50' : 'border-[#E7E5E4] bg-white'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-lg p-2',
            isOverdue ? 'bg-red-100' : 'bg-[#F97316]/10'
          )}>
            {isOverdue ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-[#F97316]" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-[#1C1917]">
              {followup.animal?.name || '回访任务'}
            </h4>
            <p className="text-sm text-[#78716C] mt-1">
              预定日期：{followup.scheduledDate?.split('T')[0] || '-'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                followupStatusColors[followup.status]
              )}>
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                {followupStatusLabels[followup.status]}
              </span>
              {!isOverdue && daysDiff > 0 && (
                <span className="text-xs text-[#78716C]">
                  还有 {daysDiff} 天
                </span>
              )}
              {isOverdue && (
                <span className="text-xs text-red-600 font-medium">
                  已逾期 {Math.abs(daysDiff)} 天
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-[#E7E5E4]/50">
        {followup.status !== 'approved' && (
          <button
            onClick={() => onSubmit(followup.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isOverdue
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#F97316] text-white hover:bg-[#EA580C]'
            )}
          >
            <Send className="h-4 w-4" />
            提交回访
          </button>
        )}
        <button
          onClick={() => onView(followup.animalId)}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
        >
          <Eye className="h-4 w-4" />
          查看详情
        </button>
      </div>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { stations, loading, fetchStations, fetchFollowups, followups } = useAppStore()
  const [user, setUser] = useState<UserType | null>(null)
  const [adoptions, setAdoptions] = useState<AdoptionWithFollowups[]>([])
  const [loadingUser, setLoadingUser] = useState(true)
  const [activeTab, setActiveTab] = useState<'adoptions' | 'followups'>('adoptions')

  useEffect(() => {
    fetchStations()
    fetchFollowups()
  }, [fetchStations, fetchFollowups])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingUser(true)
        const [userRes, adoptionsRes] = await Promise.all([
          userApi.getCurrent(),
          userApi.getMyAdoptions(),
        ])

        if (userRes.success && userRes.data) {
          setUser(userRes.data)
        }

        if (adoptionsRes.success && adoptionsRes.data) {
          const adoptionsWithFollowups = adoptionsRes.data.map((adoption) => ({
            ...adoption,
            nextFollowup: followups.find((f) => f.animalId === adoption.animalId && f.status !== 'approved'),
          }))
          setAdoptions(adoptionsWithFollowups)
        }
      } finally {
        setLoadingUser(false)
      }
    }
    loadData()
  }, [followups])

  const userStation = stations.find((s) => s.id === user?.stationId)
  const pendingFollowups = followups.filter((f) => f.status !== 'approved')

  if (loading || loadingUser) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] h-32" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <img
              src={user?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20friendly%20person&image_size=square'}
              alt={user?.name}
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-[#1C1917]">{user?.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F97316]/10 px-3 py-1 text-sm font-medium text-[#F97316]">
                  {user?.role && roleLabels[user.role]}
                </span>
              </div>
              {userStation && (
                <div className="flex items-center gap-1 text-sm text-[#78716C] mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>{userStation.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <InfoCard icon={Mail} label="邮箱" value={user?.email || '-'} />
            <InfoCard icon={Phone} label="电话" value={user?.phone || '-'} />
            <InfoCard icon={Building2} label="所属站点" value={userStation?.name || '-'} />
            <InfoCard icon={PawPrint} label="领养数量" value={`${adoptions.length} 只`} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex border-b border-[#E7E5E4]">
          <button
            onClick={() => setActiveTab('adoptions')}
            className={cn(
              'flex-1 px-6 py-4 text-sm font-medium transition-colors relative',
              activeTab === 'adoptions'
                ? 'text-[#F97316]'
                : 'text-[#78716C] hover:text-[#44403C]'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <PawPrint className="h-4 w-4" />
              我的领养
              <span className="rounded-full bg-[#F97316]/10 px-2 py-0.5 text-xs text-[#F97316]">
                {adoptions.length}
              </span>
            </div>
            {activeTab === 'adoptions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={cn(
              'flex-1 px-6 py-4 text-sm font-medium transition-colors relative',
              activeTab === 'followups'
                ? 'text-[#F97316]'
                : 'text-[#78716C] hover:text-[#44403C]'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              回访任务
              {pendingFollowups.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                  {pendingFollowups.length}
                </span>
              )}
            </div>
            {activeTab === 'followups' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316]" />
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'adoptions' ? (
            adoptions.length > 0 ? (
              <div className="space-y-4">
                {adoptions.map((adoption) => (
                  <AdoptionCard
                    key={adoption.id}
                    adoption={adoption}
                    onSubmitFollowup={(id) => navigate(`/followup/submit/${id}`)}
                    onViewDetail={(id) => navigate(`/animals/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PawPrint}
                title="暂无领养记录"
                description="前往领养中心看看可爱的小动物吧"
                actionText="去领养中心"
                onAction={() => navigate('/adoption')}
              />
            )
          ) : (
            pendingFollowups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingFollowups.map((followup) => (
                  <FollowupTaskCard
                    key={followup.id}
                    followup={followup}
                    onSubmit={(id) => navigate(`/followup/submit/${id}`)}
                    onView={(id) => navigate(`/animals/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle}
                title="暂无待完成的回访任务"
                description="所有回访任务都已完成，继续保持！"
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
