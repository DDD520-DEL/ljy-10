export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface Station {
  id: string
  name: string
  address: string
  phone: string
  email: string
  capacity: number
  description: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: 'admin' | 'staff' | 'adopter' | 'volunteer'
  stationId?: string
  createdAt: string
}

export type AnimalStatus = 'rescued' | 'tnr_in_progress' | 'tnr_completed' | 'available' | 'adopted' | 'released' | 'transferred'
export type Species = 'dog' | 'cat' | 'other'
export type Gender = 'male' | 'female' | 'unknown'
export type PhotoType = 'found' | 'pre_surgery' | 'post_surgery' | 'vaccine' | 'release' | 'adoption' | 'followup'

export interface AnimalPhoto {
  id: string
  url: string
  type: PhotoType
  caption?: string
  uploadedAt: string
}

export type TNRType = 'trap' | 'neuter' | 'vaccine' | 'release'

export interface TNROperation {
  id: string
  type: TNRType
  date: string
  location?: string
  hospital?: string
  operator?: string
  cost?: number
  notes?: string
  photos: AnimalPhoto[]
  createdAt: string
}

export interface TNRTimeline {
  trap?: TNROperation
  neuter?: TNROperation
  vaccine?: TNROperation
  release?: TNROperation
}

export interface AdoptionInfo {
  applicationId: string
  adopterId: string
  adopterName: string
  adoptedAt: string
  agreementId: string
}

export interface Animal {
  id: string
  name: string
  species: Species
  breed: string
  age: string
  gender: Gender
  foundLocation: string
  foundDate: string
  healthStatus: string
  description: string
  personality: string
  status: AnimalStatus
  stationId: string
  createdBy: string
  photos: AnimalPhoto[]
  tnrProgress: TNRTimeline
  adoptionInfo?: AdoptionInfo
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface AdoptionApplication {
  id: string
  animalId: string
  animal?: Animal
  applicantId: string
  applicantName: string
  applicantPhone: string
  applicantEmail: string
  address: string
  housingType: string
  petExperience: string
  familySituation: string
  reason: string
  documents: string[]
  status: ApplicationStatus
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
}

export interface AdoptionAgreement {
  id: string
  applicationId: string
  content: string
  signature: string
  signedAt: string
  createdAt: string
}

export type FollowupPeriod = 'week1' | 'month1' | 'month3' | 'month6' | 'year1' | 'yearly'
export type FollowupStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue'

export interface Followup {
  id: string
  animalId: string
  animal?: Animal
  adopterId: string
  adopterName: string
  scheduledDate: string
  period: FollowupPeriod
  status: FollowupStatus
  photos?: string[]
  healthStatus?: string
  description?: string
  issues?: string
  submittedAt?: string
  reviewNotes?: string
  createdAt: string
}

export interface FollowupCalendar {
  year: number
  month: number
  days: {
    date: string
    followups: Followup[]
  }[]
}

export type LifecycleEventType = 'found' | 'trap' | 'neuter' | 'vaccine' | 'release' | 'adoption_published' | 'application_submitted' | 'application_approved' | 'agreement_signed' | 'adopted' | 'followup' | 'transfer'

export interface LifecycleEvent {
  id: string
  type: LifecycleEventType
  title: string
  description: string
  date: string
  photos?: string[]
  operator?: string
}

export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface AnimalTransfer {
  id: string
  animalId: string
  animal?: Animal
  fromStationId: string
  fromStation?: Station
  toStationId: string
  toStation?: Station
  reason: string
  status: TransferStatus
  reviewNotes?: string
  reviewedAt?: string
  createdAt: string
}

export interface DashboardStats {
  totalAnimals: number
  availableForAdoption: number
  tnrInProgress: number
  followupsThisMonth: number
  pendingApplications: number
  overdueFollowups: number
  pendingTransfers: number
}

export interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  date: string
  animalId?: string
}

export interface CreateAnimalRequest {
  name: string
  species: Species
  breed: string
  age: string
  gender: Gender
  foundLocation: string
  foundDate: string
  healthStatus: string
  description: string
  personality: string
  stationId: string
  photos: string[]
}

export interface CreateTNROperationRequest {
  type: TNRType
  date: string
  location?: string
  hospital?: string
  operator?: string
  cost?: number
  notes?: string
  photos: string[]
}

export interface CreateAdoptionApplicationRequest {
  animalId: string
  applicantName: string
  applicantPhone: string
  applicantEmail: string
  address: string
  housingType: string
  petExperience: string
  familySituation: string
  reason: string
  documents: string[]
}

export interface ReviewApplicationRequest {
  status: 'approved' | 'rejected'
  reviewNotes: string
}

export interface CreateAgreementRequest {
  applicationId: string
  signature: string
  signedAt: string
}

export interface SubmitFollowupRequest {
  photos: string[]
  healthStatus: string
  description: string
  issues: string
  submittedAt: string
}

export interface CreateTransferRequest {
  animalId: string
  fromStationId: string
  toStationId: string
  reason: string
}

export interface ReviewTransferRequest {
  status: 'approved' | 'rejected'
  reviewNotes: string
}

export interface BatchAnimalImportItem {
  name: string
  species: Species
  breed: string
  age: string
  gender: Gender
  foundLocation: string
  foundDate: string
  healthStatus: string
  description: string
  personality: string
  stationId: string
  photos?: string[]
}

export interface BatchImportPreviewItem extends BatchAnimalImportItem {
  rowIndex: number
  errors: string[]
  valid: boolean
}

export interface BatchImportPreviewResponse {
  total: number
  validCount: number
  invalidCount: number
  items: BatchImportPreviewItem[]
}

export interface BatchImportResult {
  success: boolean
  importedCount: number
  failedCount: number
  importedAnimals: Animal[]
  errors: { rowIndex: number; errors: string[] }[]
  batchActivityId?: string
}
