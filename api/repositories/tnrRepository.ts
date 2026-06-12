import { db, generateId } from '../data/database.js'
import type { TNROperation, CreateTNROperationRequest, AnimalPhoto } from '../types/index.js'

export const tnrRepository = {
  findByAnimalId: (animalId: string) => {
    const animal = db.animals.find(a => a.id === animalId)
    return animal?.tnrProgress || {}
  },

  createOperation: (animalId: string, data: CreateTNROperationRequest): TNROperation | undefined => {
    const animal = db.animals.find(a => a.id === animalId)
    if (!animal) return undefined

    const photoTypeMap: Record<string, AnimalPhoto['type']> = {
      trap: 'found',
      neuter: 'post_surgery',
      vaccine: 'vaccine',
      release: 'release',
    }

    const photos: AnimalPhoto[] = data.photos.map(url => ({
      id: generateId(),
      url,
      type: photoTypeMap[data.type] || 'found',
      uploadedAt: new Date().toISOString(),
    }))

    const operation: TNROperation = {
      id: generateId(),
      ...data,
      photos,
      createdAt: new Date().toISOString(),
    }

    animal.tnrProgress[data.type] = operation

    if (data.type === 'trap') {
      animal.status = 'tnr_in_progress'
    }

    const progress = animal.tnrProgress
    if (progress.trap && progress.neuter && progress.vaccine && progress.release) {
      animal.status = 'tnr_completed'
    } else if (progress.trap && progress.neuter && progress.vaccine) {
      animal.status = 'available'
    }

    animal.updatedAt = new Date().toISOString()

    return operation
  },
}
