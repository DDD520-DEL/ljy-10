import express from 'express'
import { stationRepository } from '../repositories/stationRepository.js'
import type { ApiResponse, Station } from '../types/index.js'

const router = express.Router()

router.get('/', (req, res) => {
  try {
    const stations = stationRepository.findAll()
    const response: ApiResponse<Station[]> = {
      success: true,
      data: stations,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取站点列表失败',
    })
  }
})

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const station = stationRepository.findById(id)
    if (!station) {
      return res.status(404).json({
        success: false,
        error: '站点不存在',
      })
    }
    const response: ApiResponse<Station> = {
      success: true,
      data: station,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取站点信息失败',
    })
  }
})

router.get('/:id/members', (req, res) => {
  try {
    const { id } = req.params
    const members = stationRepository.getMembers(id)
    const response: ApiResponse<any[]> = {
      success: true,
      data: members,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取站点成员失败',
    })
  }
})

export default router
