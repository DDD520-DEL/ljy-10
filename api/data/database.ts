import type {
  Station,
  User,
  Animal,
  AdoptionApplication,
  AdoptionAgreement,
  Followup,
  AnimalTransfer,
  TNROperation,
} from '../types/index.js'

export interface BatchImportActivity {
  id: string
  importedCount: number
  importedAt: string
  importedBy: string
  animalIds: string[]
}

export interface Database {
  stations: Station[]
  users: User[]
  animals: Animal[]
  applications: AdoptionApplication[]
  agreements: AdoptionAgreement[]
  followups: Followup[]
  transfers: AnimalTransfer[]
  batchImportActivities: BatchImportActivity[]
}

export const db: Database = {
  stations: [],
  users: [],
  animals: [],
  applications: [],
  agreements: [],
  followups: [],
  transfers: [],
  batchImportActivities: [],
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
