import { db, generateId, formatDate } from '../data/database.js'
import type { Followup, FollowupCalendar, SubmitFollowupRequest } from '../types/index.js'

export const followupRepository = {
  findAll: (filters?: { status?: string; animalId?: string; adopterId?: string }) => {
    let followups = [...db.followups]

    if (filters?.status) {
      followups = followups.filter(f => f.status === filters.status)
    }
    if (filters?.animalId) {
      followups = followups.filter(f => f.animalId === filters.animalId)
    }
    if (filters?.adopterId) {
      followups = followups.filter(f => f.adopterId === filters.adopterId)
    }

    return followups.map(f => ({
      ...f,
      animal: db.animals.find(a => a.id === f.animalId),
    })).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
  },

  findById: (id: string) => {
    const followup = db.followups.find(f => f.id === id)
    if (!followup) return undefined
    return {
      ...followup,
      animal: db.animals.find(a => a.id === followup.animalId),
    }
  },

  getCalendar: (year: number, month: number): FollowupCalendar => {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    const daysInMonth = endDate.getDate()

    const days: FollowupCalendar['days'] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(new Date(year, month - 1, day))
      const followups = db.followups
        .filter(f => f.scheduledDate === date)
        .map(f => ({
          ...f,
          animal: db.animals.find(a => a.id === f.animalId),
        }))

      days.push({ date, followups })
    }

    return { year, month, days }
  },

  submitFollowup: (id: string, data: SubmitFollowupRequest): Followup | undefined => {
    const followup = db.followups.find(f => f.id === id)
    if (!followup) return undefined

    followup.photos = data.photos
    followup.healthStatus = data.healthStatus
    followup.description = data.description
    followup.issues = data.issues
    followup.submittedAt = data.submittedAt
    followup.status = 'submitted'

    return followup
  },

  reviewFollowup: (id: string, status: 'approved' | 'rejected', reviewNotes: string): Followup | undefined => {
    const followup = db.followups.find(f => f.id === id)
    if (!followup) return undefined

    followup.status = status
    followup.reviewNotes = reviewNotes

    return followup
  },
}
