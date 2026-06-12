import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Users, UserPlus, Shield, Briefcase, Heart, Building2 } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { stationApi } from '@/services/api'
import { roleLabels, type User, type Station } from '@/types'
import { cn } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

const roleIcons = {
  admin: Shield,
  staff: Briefcase,
  volunteer: Heart,
  adopter: Heart,
}

const roleColors: Record<User['role'], string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  staff: 'bg-blue-100 text-blue-700 border-blue-200',
  volunteer: 'bg-green-100 text-green-700 border-green-200',
  adopter: 'bg-purple-100 text-purple-700 border-purple-200',
}

interface StationWithMembers extends Station {
  members: User[]
}

function MemberCard({ member }: { member: User }) {
  const RoleIcon = roleIcons[member.role] || Heart

  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#FAFAF9] p-3 transition-colors hover:bg-[#F5F5F4]">
      <img
        src={member.avatar || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20${encodeURIComponent(member.name)}&image_size=square`}
        alt={member.name}
        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[#1C1917] truncate">{member.name}</p>
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
            roleColors[member.role]
          )}>
            <RoleIcon className="h-3 w-3" />
            {roleLabels[member.role]}
          </span>
        </div>
        <p className="text-sm text-[#78716C] truncate">{member.email}</p>
      </div>
      <a
        href={`tel:${member.phone}`}
        className="rounded-lg p-2 text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#F97316] transition-colors"
      >
        <Phone className="h-4 w-4" />
      </a>
    </div>
  )
}

function StationCard({ station, members }: { station: Station; members: User[] }) {
  const [showInviteModal, setShowInviteModal] = useState(false)

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <h3 className="text-xl font-bold">{station.name}</h3>
            </div>
            <div className="mt-2 flex items-center gap-1 text-orange-100 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{station.address}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{members.length}</p>
            <p className="text-sm text-orange-100">成员</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-[#57534E]">
            <Phone className="h-4 w-4 text-[#A8A29E]" />
            <span>{station.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#57534E]">
            <Mail className="h-4 w-4 text-[#A8A29E]" />
            <span className="truncate">{station.email}</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#FAFAF9] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#78716C]">收容容量</span>
            <span className="font-semibold text-[#1C1917]">{station.capacity} 只</span>
          </div>
        </div>

        {station.description && (
          <p className="text-sm text-[#78716C] line-clamp-2">{station.description}</p>
        )}

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#78716C]" />
              <span className="font-medium text-[#1C1917]">成员管理</span>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1 rounded-lg bg-[#F97316]/10 px-3 py-1.5 text-sm font-medium text-[#F97316] transition-colors hover:bg-[#F97316]/20"
            >
              <UserPlus className="h-4 w-4" />
              邀请成员
            </button>
          </div>

          {members.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-[#FAFAF9] py-8 text-center">
              <Users className="mx-auto h-8 w-8 text-[#A8A29E]" />
              <p className="mt-2 text-sm text-[#78716C]">暂无成员</p>
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1C1917]">邀请成员加入 {station.name}</h3>
            <p className="mt-1 text-sm text-[#78716C]">输入新成员的邮箱地址发送邀请</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#44403C] mb-1">邮箱地址</label>
                <input
                  type="email"
                  placeholder="请输入邮箱"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#44403C] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#44403C] mb-1">角色</label>
                <select className="w-full rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#44403C] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]">
                  <option value="staff">工作人员</option>
                  <option value="volunteer">志愿者</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('邀请已发送（模拟功能）')
                  setShowInviteModal(false)
                }}
                className="flex-1 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StationManagement() {
  const { loading, stations, fetchStations } = useAppStore()
  const [stationsWithMembers, setStationsWithMembers] = useState<StationWithMembers[]>([])

  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  useEffect(() => {
    const loadMembers = async () => {
      const data = await Promise.all(
        stations.map(async (station) => {
          try {
            const res = await stationApi.getMembers(station.id)
            return {
              ...station,
              members: res.success && res.data ? res.data : [],
            }
          } catch {
            return { ...station, members: [] }
          }
        })
      )
      setStationsWithMembers(data)
    }
    if (stations.length > 0) {
      loadMembers()
    }
  }, [stations])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1917]">站点管理</h2>
          <p className="text-sm text-[#78716C]">管理救助站点信息和成员</p>
        </div>
      </div>

      {stationsWithMembers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {stationsWithMembers.map((station) => (
            <StationCard key={station.id} station={station} members={station.members} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="暂无站点数据"
          description="添加第一个救助站点开始管理"
        />
      )}
    </div>
  )
}
