import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, AlertCircle, ArrowRightLeft, Clock } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import StatsCard from '@/components/StatsCard'
import ActivityItem from '@/components/ActivityItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { ActivityType } from '@/components/ActivityItem'

const typeMap: Record<string, ActivityType> = {
  adoption: 'adoption',
  rescue: 'rescue',
  tnr: 'tnr',
  health: 'health',
  visit: 'visit',
  animal: 'rescue',
  application: 'adoption',
  followup: 'visit',
  transfer: 'tnr',
  batch_import: 'batch_import',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    loading,
    dashboardStats,
    recentActivities,
    fetchDashboardStats,
    fetchRecentActivities,
  } = useAppStore()

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentActivities()
  }, [fetchDashboardStats, fetchRecentActivities])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          type="total"
          value={dashboardStats?.totalAnimals || 0}
          trend="up"
          trendValue="较上月 +12%"
        />
        <StatsCard
          type="available"
          value={dashboardStats?.availableForAdoption || 0}
          trend="neutral"
          trendValue="与上月持平"
        />
        <StatsCard
          type="tnr"
          value={dashboardStats?.tnrInProgress || 0}
          trend="down"
          trendValue="较上月 -8%"
        />
        <StatsCard
          type="visit"
          value={dashboardStats?.followupsThisMonth || 0}
          trend="up"
          trendValue="较上月 +15%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1C1917]">待处理任务</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                onClick={() => navigate('/adoption')}
                className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-yellow-100 p-2.5">
                      <FileText className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">待审核申请</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.pendingApplications || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/followup')}
                className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-100 p-2.5">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">逾期回访提醒</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.overdueFollowups || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/transfer')}
                className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2.5">
                      <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">待处理调配请求</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.pendingTransfers || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1C1917]">最近动态</h2>
          <div className="flex items-center gap-1 text-sm text-[#78716C]">
            <Clock className="h-4 w-4" />
            <span>最新10条</span>
          </div>
        </div>

        <div className="space-y-2">
          {recentActivities.slice(0, 10).map((activity, index) => (
            <ActivityItem
              key={activity.id || index}
              type={typeMap[activity.type] || 'rescue'}
              title={activity.title}
              description={activity.description}
              time={activity.date}
            />
          ))}
          {recentActivities.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
              暂无动态
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
