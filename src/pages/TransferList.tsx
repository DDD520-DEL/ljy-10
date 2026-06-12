import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  ArrowRightLeft,
  Building2,
  ChevronRight,
  Check,
  X,
  Clock,
  Cat,
  Dog,
  Bird,
  Eye,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  transferStatusLabels,
  speciesLabels,
  type AnimalTransfer,
  type TransferStatus,
} from '@/types'
import { cn } from '@/lib/utils'

const statusColors: Record<TransferStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
}

const statusIcons: Record<TransferStatus, typeof Clock> = {
  pending: Clock,
  approved: Check,
  rejected: X,
  completed: Check,
}

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  other: Bird,
}

function TransferCard({ transfer }: { transfer: AnimalTransfer }) {
  const navigate = useNavigate()
  const { currentUser } = useAppStore()

  const animal = transfer.animal
  const fromStation = transfer.fromStation
  const toStation = transfer.toStation
  const SpeciesIcon = animal ? speciesIcons[animal.species] || Cat : Cat
  const StatusIcon = statusIcons[transfer.status]

  const isPending = transfer.status === 'pending'
  const canReview = isPending && currentUser?.stationId === transfer.toStationId

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        {animal && (
          <div className="relative">
            <img
              src={animal.photos[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'}
              alt={animal.name}
              className="h-20 w-20 rounded-xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow">
              <SpeciesIcon className="h-4 w-4 text-[#F97316]" />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                {animal?.name || '未知动物'}
              </h3>
              {animal && (
                <p className="text-sm text-[#78716C]">
                  {speciesLabels[animal.species]} · {animal.breed || '未知品种'} · {animal.age}
                </p>
              )}
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                statusColors[transfer.status],
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {transferStatusLabels[transfer.status]}
            </span>
          </div>

          <div className="mt-4 relative">
            <style>{`
              @keyframes flowLine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              .animate-flow {
                animation: flowLine 2s linear infinite;
                background: linear-gradient(90deg, #FED7AA 0%, #F97316 50%, #FED7AA 100%);
                background-size: 200% 100%;
              }
            `}</style>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Building2 className="h-5 w-5 text-[#F97316]" />
                </div>
                <div>
                  <p className="text-xs text-[#A8A29E]">调出站点</p>
                  <p className="text-sm font-medium text-[#1C1917]">
                    {fromStation?.name || '未知站点'}
                  </p>
                </div>
              </div>

              <div className="flex-1 mx-4">
                <div className="relative flex items-center justify-center">
                  <div className="h-1 w-full rounded-full bg-gray-200" />
                  <div className="absolute h-1 w-full rounded-full animate-flow" />
                  <div className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border-2 border-[#F97316]">
                    <ArrowRightLeft className="h-4 w-4 text-[#F97316]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-[#A8A29E] text-right">调入站点</p>
                  <p className="text-sm font-medium text-[#1C1917]">
                    {toStation?.name || '未知站点'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-[#A8A29E]">
              申请时间：{new Date(transfer.createdAt).toLocaleDateString('zh-CN')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/transfers/${transfer.id}`)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-[#57534E] hover:bg-[#F5F5F4] transition-colors"
              >
                <Eye className="h-4 w-4" />
                详情
                <ChevronRight className="h-4 w-4" />
              </button>
              {canReview && (
                <button
                  onClick={() => navigate(`/transfers/${transfer.id}`)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#F97316] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#EA580C] transition-colors"
                >
                  审核
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TransferList() {
  const navigate = useNavigate()
  const { loading, transfers, fetchTransfers, currentUser, fetchCurrentUser } = useAppStore()

  useEffect(() => {
    fetchCurrentUser()
    fetchTransfers()
  }, [fetchTransfers, fetchCurrentUser])

  const sortedTransfers = [...transfers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const pendingCount = transfers.filter((t) => t.status === 'pending').length
  const myStationPending = transfers.filter(
    (t) => t.status === 'pending' && t.toStationId === currentUser?.stationId,
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">跨站调配</h1>
          <p className="text-sm text-[#78716C]">管理站点间的动物调配请求</p>
        </div>
        <button
          onClick={() => navigate('/transfer/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
        >
          <Plus className="h-4 w-4" />
          发起调配
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <ArrowRightLeft className="h-6 w-6 text-[#57534E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C1917]">{transfers.length}</p>
              <p className="text-sm text-[#78716C]">总调配数</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C1917]">{pendingCount}</p>
              <p className="text-sm text-[#78716C]">待审核总数</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <ArrowRightLeft className="h-6 w-6 text-[#F97316]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C1917]">{myStationPending}</p>
              <p className="text-sm text-[#78716C]">本站点待审核</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-full items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : sortedTransfers.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <ArrowRightLeft className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-[#1C1917]">暂无调配记录</h2>
          <p className="mt-2 text-sm text-[#78716C]">点击上方按钮发起新的调配请求</p>
          <button
            onClick={() => navigate('/transfer/new')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
          >
            <Plus className="h-4 w-4" />
            发起调配
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTransfers.map((transfer) => (
            <TransferCard key={transfer.id} transfer={transfer} />
          ))}
        </div>
      )}
    </div>
  )
}
