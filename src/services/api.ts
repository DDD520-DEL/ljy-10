import type {
  ApiResponse,
  Animal,
  Station,
  User,
  AdoptionApplication,
  Followup,
  FollowupCalendar,
  AnimalTransfer,
  TNRTimeline,
  TNROperation,
  LifecycleEvent,
  DashboardStats,
  RecentActivity,
  AdoptionAgreement,
  CreateAnimalRequest,
  CreateTNROperationRequest,
  CreateAdoptionApplicationRequest,
  ReviewApplicationRequest,
  CreateAgreementRequest,
  SubmitFollowupRequest,
  CreateTransferRequest,
  ReviewTransferRequest,
} from '../types'

const BASE_URL = '/api'

const request = async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return response.json()
}

export const dashboardApi = {
  getStats: () => request<DashboardStats>('/dashboard/stats'),
  getActivities: () => request<RecentActivity[]>('/dashboard/activities'),
}

export const animalApi = {
  getList: (params?: {
    status?: string
    species?: string
    stationId?: string
    keyword?: string
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<Animal[]>(`/animals${query ? `?${query}` : ''}`)
  },
  getAvailable: (params?: { species?: string; keyword?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<Animal[]>(`/animals/available${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => request<Animal>(`/animals/${id}`),
  getLifecycle: (id: string) => request<LifecycleEvent[]>(`/animals/${id}/lifecycle`),
  create: (data: CreateAnimalRequest) =>
    request<Animal>('/animals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Animal>) =>
    request<Animal>(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<null>(`/animals/${id}`, {
      method: 'DELETE',
    }),
}

export const tnrApi = {
  getTimeline: (animalId: string) => request<TNRTimeline>(`/tnr/${animalId}`),
  createOperation: (animalId: string, data: CreateTNROperationRequest) =>
    request<TNROperation>(`/tnr/${animalId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const adoptionApi = {
  getAvailable: (params?: { species?: string; keyword?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<Animal[]>(`/adoption/available${query ? `?${query}` : ''}`)
  },
  getApplications: (params?: { status?: string; stationId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<AdoptionApplication[]>(`/adoption/applications${query ? `?${query}` : ''}`)
  },
  getApplication: (id: string) => request<AdoptionApplication>(`/adoption/applications/${id}`),
  createApplication: (data: CreateAdoptionApplicationRequest) =>
    request<AdoptionApplication>('/adoption/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reviewApplication: (id: string, data: ReviewApplicationRequest) =>
    request<AdoptionApplication>(`/adoption/applications/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAgreement: (applicationId: string) =>
    request<AdoptionAgreement>(`/adoption/agreements/${applicationId}`),
  createAgreement: (data: CreateAgreementRequest) =>
    request<AdoptionAgreement>('/adoption/agreements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const followupApi = {
  getList: (params?: { status?: string; animalId?: string; adopterId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<Followup[]>(`/followups${query ? `?${query}` : ''}`)
  },
  getCalendar: (params?: { year?: number; month?: number }) => {
    const query = new URLSearchParams(params as unknown as Record<string, string>).toString()
    return request<FollowupCalendar>(`/followups/calendar${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => request<Followup>(`/followups/${id}`),
  submit: (id: string, data: SubmitFollowupRequest) =>
    request<Followup>(`/followups/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  review: (id: string, status: 'approved' | 'rejected', reviewNotes: string) =>
    request<Followup>(`/followups/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNotes }),
    }),
}

export const transferApi = {
  getList: (params?: { status?: string; stationId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return request<AnimalTransfer[]>(`/transfers${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => request<AnimalTransfer>(`/transfers/${id}`),
  create: (data: CreateTransferRequest) =>
    request<AnimalTransfer>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  review: (id: string, data: ReviewTransferRequest) =>
    request<AnimalTransfer>(`/transfers/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export const stationApi = {
  getList: () => request<Station[]>('/stations'),
  getById: (id: string) => request<Station>(`/stations/${id}`),
  getMembers: (id: string) => request<User[]>(`/stations/${id}/members`),
}

export const userApi = {
  getCurrent: () => request<User>('/users/me'),
  getMyAdoptions: () => request<AdoptionApplication[]>('/users/me/adoptions'),
  getById: (id: string) => request<User>(`/users/${id}`),
}
