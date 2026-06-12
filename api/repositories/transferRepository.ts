import { db, generateId } from '../data/database.js'
import type { AnimalTransfer, CreateTransferRequest, ReviewTransferRequest } from '../types/index.js'

export const transferRepository = {
  findAll: (filters?: { status?: string; stationId?: string }) => {
    let transfers = [...db.transfers]

    if (filters?.status) {
      transfers = transfers.filter(t => t.status === filters.status)
    }
    if (filters?.stationId) {
      transfers = transfers.filter(t =>
        t.fromStationId === filters.stationId || t.toStationId === filters.stationId
      )
    }

    return transfers.map(t => ({
      ...t,
      animal: db.animals.find(a => a.id === t.animalId),
      fromStation: db.stations.find(s => s.id === t.fromStationId),
      toStation: db.stations.find(s => s.id === t.toStationId),
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  findById: (id: string) => {
    const transfer = db.transfers.find(t => t.id === id)
    if (!transfer) return undefined
    return {
      ...transfer,
      animal: db.animals.find(a => a.id === transfer.animalId),
      fromStation: db.stations.find(s => s.id === transfer.fromStationId),
      toStation: db.stations.find(s => s.id === transfer.toStationId),
    }
  },

  create: (data: CreateTransferRequest): AnimalTransfer => {
    const transfer: AnimalTransfer = {
      id: generateId(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    db.transfers.unshift(transfer)

    const animal = db.animals.find(a => a.id === data.animalId)
    if (animal) {
      animal.status = 'transferred'
      animal.updatedAt = new Date().toISOString()
    }

    return transfer
  },

  review: (id: string, data: ReviewTransferRequest): AnimalTransfer | undefined => {
    const transfer = db.transfers.find(t => t.id === id)
    if (!transfer) return undefined

    transfer.status = data.status === 'approved' ? 'completed' : data.status
    transfer.reviewNotes = data.reviewNotes
    transfer.reviewedAt = new Date().toISOString()

    if (data.status === 'approved') {
      const animal = db.animals.find(a => a.id === transfer.animalId)
      if (animal) {
        animal.stationId = transfer.toStationId
        animal.status = 'available'
        animal.updatedAt = new Date().toISOString()
      }
    } else {
      const animal = db.animals.find(a => a.id === transfer.animalId)
      if (animal) {
        animal.status = 'available'
        animal.updatedAt = new Date().toISOString()
      }
    }

    return transfer
  },
}
