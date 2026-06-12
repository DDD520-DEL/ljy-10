import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Calendar,
  Cat,
  Dog,
  User,
  Phone,
  Clock as ClockIcon,
  Loader2,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { followupStatusLabels, periodLabels, type Followup } from '@/types'
import { cn } from '@/lib/utils'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

const statusDotColors = {
  pending: 'bg-yellow-500',
  submitted: 'bg-blue-500',
  approved: 'bg-green-500',
  overdue: 'bg-red-500',
}

function FollowupModal({
  followups,
  date,
  onClose,
}: {
  followups: Followup[]
  date: string
  onClose: () => void
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">回访详情</h3>
              <p className="text-sm text-gray-500">{formatDate(date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          {followups.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-gray-500">当天没有回访安排</p>
            </div>
          ) : (
            followups.map((followup) => (
              <div
                key={followup.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={followup.animal?.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'}
                    alt={followup.animal?.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {followup.animal?.name || '未知动物'}
                      </h4>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium',
                          statusColors[followup.status]
                        )}
                      >
                        {followupStatusLabels[followup.status]}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">周期：</span>
                        <span>{periodLabels[followup.period]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{followup.adopterName}</span>
                      </div>
                    </div>
                    {followup.description && (
                      <p className="mt-3 text-sm text-gray-500">{followup.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function FollowupCalendar() {
  const { followups, loading, fetchFollowups } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchFollowups()
  }, [fetchFollowups])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isOverdue = (dateStr: string, status: string) => {
    if (status !== 'pending') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const followupDate = new Date(dateStr)
    followupDate.setHours(0, 0, 0, 0)
    return followupDate < today
  }

  const getFollowupsForDate = (date: string) => {
    return followups.filter((f) => {
      const fDate = new Date(f.scheduledDate).toDateString()
      const targetDate = new Date(date).toDateString()
      return fDate === targetDate
    })
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const pendingFollowups = followups.filter((f) => f.status === 'pending' || f.status === 'overdue')

  const renderCalendar = () => {
    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 rounded-xl" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayFollowups = getFollowupsForDate(dateStr)
      const hasOverdue = dayFollowups.some((f) => isOverdue(f.scheduledDate, f.status))
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString()

      days.push(
        <div
          key={day}
          onClick={() => dayFollowups.length > 0 && handleDateClick(dateStr)}
          className={cn(
            'relative h-24 rounded-xl border p-2 transition-all duration-200',
            dayFollowups.length > 0 ? 'cursor-pointer hover:bg-green-50' : '',
            isToday ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white',
            hasOverdue ? 'bg-red-50' : ''
          )}
        >
          <div
            className={cn(
              'text-sm font-medium',
              isToday ? 'text-green-600' : hasOverdue ? 'text-red-600' : 'text-gray-700'
            )}
          >
            {day}
          </div>
          {isToday && (
            <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
          )}
          {dayFollowups.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {dayFollowups.slice(0, 4).map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isOverdue(f.scheduledDate, f.status)
                      ? statusDotColors.overdue
                      : statusDotColors[f.status]
                  )}
                />
              ))}
              {dayFollowups.length > 4 && (
                <span className="text-xs text-gray-500">+{dayFollowups.length - 4}</span>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">回访日历</h1>
          <p className="mt-2 text-gray-600">查看和管理领养后回访安排</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {year}年 {monthNames[month]}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-600">待提交</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">已提交</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">已通过</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">已逾期</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">待提交回访</h3>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {pendingFollowups.length}
                </span>
              </div>

              {pendingFollowups.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-300" />
                  <p className="mt-3 text-sm text-gray-500">暂无待提交的回访</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFollowups.map((followup) => {
                    const overdue = isOverdue(followup.scheduledDate, followup.status)
                    return (
                      <div
                        key={followup.id}
                        className={cn(
                          'rounded-xl border p-4 transition-all hover:shadow-md',
                          overdue
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-100 bg-gray-50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={followup.animal?.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'}
                            alt={followup.animal?.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="truncate font-medium text-gray-900">
                                {followup.animal?.name || '未知动物'}
                              </h4>
                              <span
                                className={cn(
                                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                                  overdue ? statusColors.overdue : statusColors.pending
                                )}
                              >
                                {overdue ? '已逾期' : followupStatusLabels[followup.status]}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="text-gray-400">周期：</span>
                                <span>{periodLabels[followup.period]}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="truncate">{followup.adopterName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>查看详情</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <ClockIcon
                                  className={cn('h-3 w-3', overdue ? 'text-red-500' : 'text-gray-400')}
                                />
                                <span className={overdue ? 'text-red-600' : 'text-gray-500'}>
                                  {formatDate(followup.scheduledDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">本月统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-yellow-50 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {followups.filter((f) => f.status === 'pending').length}
                  </p>
                  <p className="mt-1 text-xs text-yellow-700">待提交</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {followups.filter((f) => f.status === 'submitted').length}
                  </p>
                  <p className="mt-1 text-xs text-blue-700">已提交</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {followups.filter((f) => f.status === 'approved').length}
                  </p>
                  <p className="mt-1 text-xs text-green-700">已通过</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {followups.filter((f) => isOverdue(f.scheduledDate, f.status)).length}
                  </p>
                  <p className="mt-1 text-xs text-red-700">已逾期</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedDate && (
        <FollowupModal
          followups={getFollowupsForDate(selectedDate)}
          date={selectedDate}
          onClose={() => {
            setShowModal(false)
            setSelectedDate(null)
          }}
        />
      )}
    </div>
  )
}
