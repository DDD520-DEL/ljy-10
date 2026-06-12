import express, { type Request } from 'express'
import { animalRepository } from '../repositories/animalRepository.js'
import type {
  ApiResponse,
  Animal,
  CreateAnimalRequest,
  LifecycleEvent,
  AnimalStatus,
  Species,
  BatchAnimalImportItem,
  BatchImportPreviewResponse,
  BatchImportResult,
} from '../types/index.js'

const router = express.Router()

interface AnimalQuery {
  status?: string
  species?: string
  stationId?: string
  keyword?: string
}

router.get('/', (req: Request<unknown, unknown, unknown, AnimalQuery>, res) => {
  try {
    const { status, species, stationId, keyword } = req.query
    const animals = animalRepository.findAll({
      status: status as AnimalStatus | undefined,
      species: species as Species | undefined,
      stationId,
      keyword,
    })
    const response: ApiResponse<Animal[]> = {
      success: true,
      data: animals,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取动物列表失败',
    })
  }
})

router.get('/available', (req: Request<unknown, unknown, unknown, { species?: string; keyword?: string }>, res) => {
  try {
    const { species, keyword } = req.query
    const animals = animalRepository.findAvailableForAdoption({ species, keyword })
    const response: ApiResponse<Animal[]> = {
      success: true,
      data: animals,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取待领养动物失败',
    })
  }
})

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const animal = animalRepository.findById(id)
    if (!animal) {
      return res.status(404).json({
        success: false,
        error: '动物不存在',
      })
    }
    const response: ApiResponse<Animal> = {
      success: true,
      data: animal,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取动物详情失败',
    })
  }
})

router.get('/:id/lifecycle', (req, res) => {
  try {
    const { id } = req.params
    const events = animalRepository.getLifecycle(id)
    const response: ApiResponse<LifecycleEvent[]> = {
      success: true,
      data: events,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取生命周期时间轴失败',
    })
  }
})

router.post('/', (req, res) => {
  try {
    const data: CreateAnimalRequest = req.body
    const animal = animalRepository.create(data)
    const response: ApiResponse<Animal> = {
      success: true,
      data: animal,
      message: '动物信息创建成功',
    }
    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建动物信息失败',
    })
  }
})

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const animal = animalRepository.update(id, data)
    if (!animal) {
      return res.status(404).json({
        success: false,
        error: '动物不存在',
      })
    }
    const response: ApiResponse<Animal> = {
      success: true,
      data: animal,
      message: '动物信息更新成功',
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新动物信息失败',
    })
  }
})

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const success = animalRepository.delete(id)
    if (!success) {
      return res.status(404).json({
        success: false,
        error: '动物不存在',
      })
    }
    res.json({
      success: true,
      message: '动物信息删除成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除动物信息失败',
    })
  }
})

router.post('/batch/preview', (req, res) => {
  try {
    const { items } = req.body as { items: BatchAnimalImportItem[] }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的导入数据',
      })
    }

    const previewItems = items.map((item, index) =>
      animalRepository.validateImportItem(item, index + 1),
    )

    const validCount = previewItems.filter(i => i.valid).length
    const invalidCount = previewItems.length - validCount

    const response: ApiResponse<BatchImportPreviewResponse> = {
      success: true,
      data: {
        total: previewItems.length,
        validCount,
        invalidCount,
        items: previewItems,
      },
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '预览导入数据失败',
    })
  }
})

router.post('/batch/import', (req, res) => {
  try {
    const { items, createdBy } = req.body as { items: BatchAnimalImportItem[]; createdBy?: string }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的导入数据',
      })
    }

    const result = animalRepository.batchCreate(items, createdBy || 'user-1')

    const response: ApiResponse<BatchImportResult> = {
      success: result.success,
      data: result,
      message: result.success
        ? `成功导入 ${result.importedCount} 条记录${result.failedCount > 0 ? `，${result.failedCount} 条失败` : ''}`
        : '导入失败',
    }

    if (result.success) {
      res.status(201).json(response)
    } else {
      res.status(400).json(response)
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '批量导入失败',
    })
  }
})

export default router
