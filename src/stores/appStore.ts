import { create } from 'zustand'
import type {
  Animal,
  Station,
  User,
  AdoptionApplication,
  Followup,
  AnimalTransfer,
  DashboardStats,
  RecentActivity,
  LifecycleEvent,
  AdoptionAgreement,
  BatchAnimalImportItem,
  BatchImportResult,
} from '../types'
import {
  dashboardApi,
  animalApi,
  stationApi,
  userApi,
  adoptionApi,
  followupApi,
  transferApi,
  tnrApi,
} from '../services/api'

interface AppState {
  loading: boolean
  error: string | null
  currentUser: User | null
  stations: Station[]
  animals: Animal[]
  currentAnimal: Animal | null
  lifecycleEvents: LifecycleEvent[]
  availableAnimals: Animal[]
  applications: AdoptionApplication[]
  currentApplication: AdoptionApplication | null
  agreement: AdoptionAgreement | null
  followups: Followup[]
  transfers: AnimalTransfer[]
  dashboardStats: DashboardStats | null
  recentActivities: RecentActivity[]
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchCurrentUser: () => Promise<void>
  fetchStations: () => Promise<void>
  fetchDashboardStats: () => Promise<void>
  fetchRecentActivities: () => Promise<void>
  fetchAnimals: (params?: any) => Promise<void>
  fetchAvailableAnimals: (params?: any) => Promise<void>
  fetchAnimalById: (id: string) => Promise<void>
  fetchLifecycle: (animalId: string) => Promise<void>
  createAnimal: (data: any) => Promise<any>
  updateAnimal: (id: string, data: any) => Promise<any>
  deleteAnimal: (id: string) => Promise<boolean>
  createTNROperation: (animalId: string, data: any) => Promise<any>
  fetchApplications: (params?: any) => Promise<void>
  fetchApplicationById: (id: string) => Promise<void>
  createApplication: (data: any) => Promise<any>
  reviewApplication: (id: string, data: any) => Promise<any>
  fetchAgreement: (applicationId: string) => Promise<void>
  createAgreement: (data: any) => Promise<any>
  fetchFollowups: (params?: any) => Promise<void>
  submitFollowup: (id: string, data: any) => Promise<any>
  fetchTransfers: (params?: any) => Promise<void>
  createTransfer: (data: any) => Promise<any>
  reviewTransfer: (id: string, data: any) => Promise<any>
  clearCurrentAnimal: () => void
  clearCurrentApplication: () => void
  clearAgreement: () => void
  batchImportAnimals: (items: BatchAnimalImportItem[]) => Promise<BatchImportResult | null>
}

export const useAppStore = create<AppState>((set) => ({
  loading: false,
  error: null,
  currentUser: null,
  stations: [],
  animals: [],
  currentAnimal: null,
  lifecycleEvents: [],
  availableAnimals: [],
  applications: [],
  currentApplication: null,
  agreement: null,
  followups: [],
  transfers: [],
  dashboardStats: null,
  recentActivities: [],

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchCurrentUser: async () => {
    try {
      set({ loading: true })
      const res = await userApi.getCurrent()
      if (res.success && res.data) {
        set({ currentUser: res.data })
      }
    } catch (error) {
      set({ error: '获取用户信息失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchStations: async () => {
    try {
      set({ loading: true })
      const res = await stationApi.getList()
      if (res.success && res.data) {
        set({ stations: res.data })
      }
    } catch (error) {
      set({ error: '获取站点列表失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchDashboardStats: async () => {
    try {
      set({ loading: true })
      const res = await dashboardApi.getStats()
      if (res.success && res.data) {
        set({ dashboardStats: res.data })
      }
    } catch (error) {
      set({ error: '获取统计数据失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchRecentActivities: async () => {
    try {
      set({ loading: true })
      const res = await dashboardApi.getActivities()
      if (res.success && res.data) {
        set({ recentActivities: res.data })
      }
    } catch (error) {
      set({ error: '获取最近动态失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchAnimals: async (params) => {
    try {
      set({ loading: true })
      const res = await animalApi.getList(params)
      if (res.success && res.data) {
        set({ animals: res.data })
      }
    } catch (error) {
      set({ error: '获取动物列表失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchAvailableAnimals: async (params) => {
    try {
      set({ loading: true })
      const res = await animalApi.getAvailable(params)
      if (res.success && res.data) {
        set({ availableAnimals: res.data })
      }
    } catch (error) {
      set({ error: '获取待领养动物失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchAnimalById: async (id: string) => {
    try {
      set({ loading: true })
      const res = await animalApi.getById(id)
      if (res.success && res.data) {
        set({ currentAnimal: res.data })
      }
    } catch (error) {
      set({ error: '获取动物详情失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchLifecycle: async (animalId: string) => {
    try {
      set({ loading: true })
      const res = await animalApi.getLifecycle(animalId)
      if (res.success && res.data) {
        set({ lifecycleEvents: res.data })
      }
    } catch (error) {
      set({ error: '获取生命周期时间轴失败' })
    } finally {
      set({ loading: false })
    }
  },

  createAnimal: async (data) => {
    try {
      set({ loading: true })
      const res = await animalApi.create(data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '创建失败')
    } finally {
      set({ loading: false })
    }
  },

  updateAnimal: async (id: string, data) => {
    try {
      set({ loading: true })
      const res = await animalApi.update(id, data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '更新失败')
    } finally {
      set({ loading: false })
    }
  },

  deleteAnimal: async (id: string) => {
    try {
      set({ loading: true })
      const res = await animalApi.delete(id)
      return res.success
    } catch (error) {
      set({ error: '删除失败' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  createTNROperation: async (animalId: string, data) => {
    try {
      set({ loading: true })
      const res = await tnrApi.createOperation(animalId, data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '创建失败')
    } finally {
      set({ loading: false })
    }
  },

  fetchApplications: async (params) => {
    try {
      set({ loading: true })
      const res = await adoptionApi.getApplications(params)
      if (res.success && res.data) {
        set({ applications: res.data })
      }
    } catch (error) {
      set({ error: '获取申请列表失败' })
    } finally {
      set({ loading: false })
    }
  },

  fetchApplicationById: async (id: string) => {
    try {
      set({ loading: true })
      const res = await adoptionApi.getApplication(id)
      if (res.success && res.data) {
        set({ currentApplication: res.data })
      }
    } catch (error) {
      set({ error: '获取申请详情失败' })
    } finally {
      set({ loading: false })
    }
  },

  createApplication: async (data) => {
    try {
      set({ loading: true })
      const res = await adoptionApi.createApplication(data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '提交失败')
    } finally {
      set({ loading: false })
    }
  },

  reviewApplication: async (id: string, data) => {
    try {
      set({ loading: true })
      const res = await adoptionApi.reviewApplication(id, data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '审核失败')
    } finally {
      set({ loading: false })
    }
  },

  fetchAgreement: async (applicationId: string) => {
    try {
      set({ loading: true })
      const res = await adoptionApi.getAgreement(applicationId)
      if (res.success && res.data) {
        set({ agreement: res.data })
      }
    } catch (error) {
      set({ error: '获取协议失败' })
    } finally {
      set({ loading: false })
    }
  },

  createAgreement: async (data) => {
    try {
      set({ loading: true })
      const res = await adoptionApi.createAgreement(data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '签订失败')
    } finally {
      set({ loading: false })
    }
  },

  fetchFollowups: async (params) => {
    try {
      set({ loading: true })
      const res = await followupApi.getList(params)
      if (res.success && res.data) {
        set({ followups: res.data })
      }
    } catch (error) {
      set({ error: '获取回访列表失败' })
    } finally {
      set({ loading: false })
    }
  },

  submitFollowup: async (id: string, data) => {
    try {
      set({ loading: true })
      const res = await followupApi.submit(id, data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '提交失败')
    } finally {
      set({ loading: false })
    }
  },

  fetchTransfers: async (params) => {
    try {
      set({ loading: true })
      const res = await transferApi.getList(params)
      if (res.success && res.data) {
        set({ transfers: res.data })
      }
    } catch (error) {
      set({ error: '获取调配列表失败' })
    } finally {
      set({ loading: false })
    }
  },

  createTransfer: async (data) => {
    try {
      set({ loading: true })
      const res = await transferApi.create(data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '发起失败')
    } finally {
      set({ loading: false })
    }
  },

  reviewTransfer: async (id: string, data) => {
    try {
      set({ loading: true })
      const res = await transferApi.review(id, data)
      if (res.success) {
        return res.data
      }
      throw new Error(res.error || '审核失败')
    } finally {
      set({ loading: false })
    }
  },

  clearCurrentAnimal: () => set({ currentAnimal: null, lifecycleEvents: [] }),
  clearCurrentApplication: () => set({ currentApplication: null }),
  clearAgreement: () => set({ agreement: null }),

  batchImportAnimals: async (items) => {
    try {
      set({ loading: true })
      const res = await animalApi.batchImport(items)
      if (res.success && res.data) {
        return res.data
      }
      throw new Error(res.error || '导入失败')
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '导入失败' })
      return null
    } finally {
      set({ loading: false })
    }
  },
}))
