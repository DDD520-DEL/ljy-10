import express from 'express'
import { tnrRepository } from '../repositories/tnrRepository.js'
import type { ApiResponse, TNRTimeline, TNROperation, CreateTNROperationRequest } from '../types/index.js'

const router = express.Router()

router.get('/:animalId', (req, res) => {
  try {
    const { animalId } = req.params
    const timeline = tnrRepository.findByAnimalId(animalId)
    const response: ApiResponse<TNRTimeline> = {
      success: true,
      data: timeline,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取TNR时间线失败',
    })
  }
})

router.post('/:animalId', (req, res) => {
  try {
    const { animalId } = req.params
    const data: CreateTNROperationRequest = req.body
    const operation = tnrRepository.createOperation(animalId, data)
    if (!operation) {
      return res.status(404).json({
        success: false,
        error: '动物不存在',
      })
    }
    const response: ApiResponse<TNROperation> = {
      success: true,
      data: operation,
      message: 'TNR操作记录创建成功',
    }
    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建TNR操作记录失败',
    })
  }
})

export default router
