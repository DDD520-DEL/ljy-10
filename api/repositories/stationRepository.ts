import { db } from '../data/database.js'
import type { Station } from '../types/index.js'

export const stationRepository = {
  findAll: (): Station[] => {
    return db.stations
  },

  findById: (id: string): Station | undefined => {
    return db.stations.find(s => s.id === id)
  },

  getMembers: (stationId: string) => {
    return db.users.filter(u => u.stationId === stationId)
  },
}
