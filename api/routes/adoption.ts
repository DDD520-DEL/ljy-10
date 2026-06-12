import express, { type Request } from 'express'
import { adoptionRepository } from '../repositories/adoptionRepository.js'
import { animalRepository } from '../repositories/animalRepository.js'
import type {
  ApiResponse,
  AdoptionApplication,
  CreateAdoptionApplicationRequest,
  ReviewApplicationRequest,
  AdoptionAgreement,
  CreateAgreementRequest,
} from '../types/index.js'

const router = express.Router()

interface ApplicationQuery {
  status?: string
  stationId?: string
}

router.get('/available', (req: Request<unknown, unknown, unknown, { species?: string; keyword?: string }>, res) => {
  try {
    const { species, keyword } = req.query
    const animals = animalRepository.findAvailableForAdoption({ species, keyword })
    const response: ApiResponse<any[]> = {
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

router.get('/applications', (req: Request<unknown, unknown, unknown, ApplicationQuery>, res) => {
  try {
    const { status, stationId } = req.query
    const applications = adoptionRepository.findApplications({ status, stationId })
    const response: ApiResponse<any[]> = {
      success: true,
      data: applications,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取领养申请列表失败',
    })
  }
})

router.get('/applications/:id', (req, res) => {
  try {
    const { id } = req.params
    const application = adoptionRepository.findApplicationById(id)
    if (!application) {
      return res.status(404).json({
        success: false,
        error: '领养申请不存在',
      })
    }
    const response: ApiResponse<any> = {
      success: true,
      data: application,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取领养申请详情失败',
    })
  }
})

router.post('/applications', (req, res) => {
  try {
    const data: CreateAdoptionApplicationRequest = req.body
    const application = adoptionRepository.createApplication(data)
    const response: ApiResponse<AdoptionApplication> = {
      success: true,
      data: application,
      message: '领养申请提交成功',
    }
    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '提交领养申请失败',
    })
  }
})

router.put('/applications/:id/review', (req, res) => {
  try {
    const { id } = req.params
    const data: ReviewApplicationRequest = req.body
    const application = adoptionRepository.reviewApplication(id, data)
    if (!application) {
      return res.status(404).json({
        success: false,
        error: '领养申请不存在',
      })
    }
    const response: ApiResponse<AdoptionApplication> = {
      success: true,
      data: application,
      message: '审核完成',
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '审核领养申请失败',
    })
  }
})

router.get('/agreements/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params
    const agreement = adoptionRepository.findAgreementByApplicationId(applicationId)
    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: '领养协议不存在',
      })
    }
    const response: ApiResponse<AdoptionAgreement> = {
      success: true,
      data: agreement,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取领养协议失败',
    })
  }
})

router.post('/agreements', (req, res) => {
  try {
    const data: CreateAgreementRequest = req.body
    const agreement = adoptionRepository.createAgreement(data)
    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: '领养申请不存在',
      })
    }
    const response: ApiResponse<AdoptionAgreement> = {
      success: true,
      data: agreement,
      message: '领养协议签订成功',
    }
    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '签订领养协议失败',
    })
  }
})

export default router
