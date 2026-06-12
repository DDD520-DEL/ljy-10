import express, { type Request } from 'express'
import { transferRepository } from '../repositories/transferRepository.js'
import type {
  ApiResponse,
  AnimalTransfer,
  CreateTransferRequest,
  ReviewTransferRequest,
} from '../types/index.js'

const router = express.Router()

interface TransferQuery {
  status?: string
  stationId?: string
}

router.get('/', (req: Request<unknown, unknown, unknown, TransferQuery>, res) => {
  try {
    const { status, stationId } = req.query
    const transfers = transferRepository.findAll({ status, stationId })
    const response: ApiResponse<any[]> = {
      success: true,
      data: transfers,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取调配列表失败',
    })
  }
})

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const transfer = transferRepository.findById(id)
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: '调配记录不存在',
      })
    }
    const response: ApiResponse<any> = {
      success: true,
      data: transfer,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取调配详情失败',
    })
  }
})

router.post('/', (req, res) => {
  try {
    const data: CreateTransferRequest = req.body
    const transfer = transferRepository.create(data)
    const response: ApiResponse<AnimalTransfer> = {
      success: true,
      data: transfer,
      message: '调配请求已发送',
    }
    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '发起调配请求失败',
    })
  }
})

router.put('/:id/review', (req, res) => {
  try {
    const { id } = req.params
    const data: ReviewTransferRequest = req.body
    const transfer = transferRepository.review(id, data)
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: '调配记录不存在',
      })
    }
    const response: ApiResponse<AnimalTransfer> = {
      success: true,
      data: transfer,
      message: '调配审核完成',
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '审核调配请求失败',
    })
  }
})

export default router
