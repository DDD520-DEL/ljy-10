import express from 'express'
import { userRepository } from '../repositories/userRepository.js'
import type { ApiResponse, User } from '../types/index.js'

const router = express.Router()

router.get('/me', (req, res) => {
  try {
    const user = userRepository.getCurrentUser()
    const response: ApiResponse<User> = {
      success: true,
      data: user,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    })
  }
})

router.get('/me/adoptions', (req, res) => {
  try {
    const user = userRepository.getCurrentUser()
    const adoptions = userRepository.getMyAdoptions(user.id)
    const response: ApiResponse<any[]> = {
      success: true,
      data: adoptions,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取我的领养记录失败',
    })
  }
})

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const user = userRepository.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      })
    }
    const response: ApiResponse<User> = {
      success: true,
      data: user,
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    })
  }
})

export default router
