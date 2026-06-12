import { db } from '../data/database.js'
import type { User } from '../types/index.js'

export const userRepository = {
  findAll: (): User[] => {
    return db.users
  },

  findById: (id: string): User | undefined => {
    return db.users.find(u => u.id === id)
  },

  findByRole: (role: User['role']): User[] => {
    return db.users.filter(u => u.role === role)
  },

  getCurrentUser: (): User => {
    return db.users[0]
  },

  getMyAdoptions: (userId: string) => {
    return db.applications.filter(a => a.applicantId === userId)
  },
}
