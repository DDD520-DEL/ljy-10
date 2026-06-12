import express from 'express'
import { dashboardService } from '../services/dashboardService.js'
import type { ApiResponse, DashboardStats, RecentActivity } from '../types/index.js'

const router = express.Router()

router.get('/stats', (req, res) => {
  try {
    const stats = dashboardService.getStats()
    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取统计数据失败',
    })
  }
})

router.get('/activities', (req, res) => {
  try {
    const activities = dashboardService.getRecentActivities()
    const response: ApiResponse<RecentActivity[]> = {
      success: true,
      data: activities,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取最近动态失败',
    })
  }
})

export default router
