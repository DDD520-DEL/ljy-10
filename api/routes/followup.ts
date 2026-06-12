import express, { type Request } from 'express'
import { followupRepository } from '../repositories/followupRepository.js'
import type {
  ApiResponse,
  Followup,
  FollowupCalendar,
  SubmitFollowupRequest,
} from '../types/index.js'

const router = express.Router()

interface FollowupQuery {
  status?: string
  animalId?: string
  adopterId?: string
}

router.get('/', (req: Request<unknown, unknown, unknown, FollowupQuery>, res) => {
  try {
    const { status, animalId, adopterId } = req.query
    const followups = followupRepository.findAll({ status, animalId, adopterId })
    const response: ApiResponse<any[]> = {
      success: true,
      data: followups,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取回访列表失败',
    })
  }
})

router.get('/calendar', (req: Request<unknown, unknown, unknown, { year?: string; month?: string }>, res) => {
  try {
    const now = new Date()
    const year = parseInt((req.query.year as string) || String(now.getFullYear()))
    const month = parseInt((req.query.month as string) || String(now.getMonth() + 1))
    const calendar = followupRepository.getCalendar(year, month)
    const response: ApiResponse<FollowupCalendar> = {
      success: true,
      data: calendar,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取回访日历失败',
    })
  }
})

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const followup = followupRepository.findById(id)
    if (!followup) {
      return res.status(404).json({
        success: false,
        error: '回访记录不存在',
      })
    }
    const response: ApiResponse<any> = {
      success: true,
      data: followup,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取回访详情失败',
    })
  }
})

router.post('/:id/submit', (req, res) => {
  try {
    const { id } = req.params
    const data: SubmitFollowupRequest = req.body
    const followup = followupRepository.submitFollowup(id, data)
    if (!followup) {
      return res.status(404).json({
        success: false,
        error: '回访记录不存在',
      })
    }
    const response: ApiResponse<Followup> = {
      success: true,
      data: followup,
      message: '回访报告提交成功',
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '提交回访报告失败',
    })
  }
})

router.put('/:id/review', (req, res) => {
  try {
    const { id } = req.params
    const { status, reviewNotes } = req.body
    const followup = followupRepository.reviewFollowup(id, status, reviewNotes)
    if (!followup) {
      return res.status(404).json({
        success: false,
        error: '回访记录不存在',
      })
    }
    const response: ApiResponse<Followup> = {
      success: true,
      data: followup,
      message: '回访审核完成',
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '审核回访报告失败',
    })
  }
})

export default router
