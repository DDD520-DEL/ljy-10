import { db, generateId } from '../data/database.js'
import type {
  Animal,
  CreateAnimalRequest,
  AnimalPhoto,
  LifecycleEvent,
  AnimalStatus,
  Species,
  Gender,
  BatchAnimalImportItem,
  BatchImportPreviewItem,
  BatchImportResult,
} from '../types/index.js'

export const animalRepository = {
  findAll: (filters?: {
    status?: AnimalStatus
    species?: string
    stationId?: string
    keyword?: string
  }): Animal[] => {
    let animals = [...db.animals]

    if (filters?.status) {
      animals = animals.filter(a => a.status === filters.status)
    }
    if (filters?.species) {
      animals = animals.filter(a => a.species === filters.species)
    }
    if (filters?.stationId) {
      animals = animals.filter(a => a.stationId === filters.stationId)
    }
    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase()
      animals = animals.filter(a =>
        a.name.toLowerCase().includes(keyword) ||
        a.breed.toLowerCase().includes(keyword) ||
        a.description.toLowerCase().includes(keyword)
      )
    }

    return animals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  findById: (id: string): Animal | undefined => {
    return db.animals.find(a => a.id === id)
  },

  findAvailableForAdoption: (filters?: { species?: string; keyword?: string }): Animal[] => {
    let animals = db.animals.filter(a => a.status === 'available')

    if (filters?.species) {
      animals = animals.filter(a => a.species === filters.species)
    }
    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase()
      animals = animals.filter(a =>
        a.name.toLowerCase().includes(keyword) ||
        a.breed.toLowerCase().includes(keyword)
      )
    }

    return animals
  },

  create: (data: CreateAnimalRequest & { createdBy?: string }): Animal => {
    const photos: AnimalPhoto[] = data.photos.map((url, index) => ({
      id: generateId(),
      url,
      type: index === 0 ? 'found' : 'found',
      uploadedAt: new Date().toISOString(),
    }))

    const animal: Animal = {
      id: generateId(),
      ...data,
      status: 'rescued',
      createdBy: data.createdBy || 'user-1',
      photos,
      tnrProgress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.animals.unshift(animal)
    return animal
  },

  update: (id: string, data: Partial<Animal>): Animal | undefined => {
    const index = db.animals.findIndex(a => a.id === id)
    if (index === -1) return undefined

    db.animals[index] = {
      ...db.animals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return db.animals[index]
  },

  delete: (id: string): boolean => {
    const index = db.animals.findIndex(a => a.id === id)
    if (index === -1) return false

    db.animals.splice(index, 1)
    return true
  },

  validateImportItem: (item: BatchAnimalImportItem, rowIndex: number): BatchImportPreviewItem => {
    const errors: string[] = []
    const validSpecies: Species[] = ['dog', 'cat', 'other']
    const validGenders: Gender[] = ['male', 'female', 'unknown']

    if (!item.name || !item.name.trim()) {
      errors.push('动物名称不能为空')
    }
    if (!item.species || !validSpecies.includes(item.species as Species)) {
      errors.push(`物种必须是: ${validSpecies.join('、')}`)
    }
    if (!item.breed) {
      item.breed = '未知'
    }
    if (!item.age || !item.age.trim()) {
      errors.push('年龄不能为空')
    }
    if (!item.gender || !validGenders.includes(item.gender as Gender)) {
      errors.push(`性别必须是: ${validGenders.join('、')}`)
    }
    if (!item.foundLocation || !item.foundLocation.trim()) {
      errors.push('发现位置不能为空')
    }
    if (!item.foundDate) {
      errors.push('发现日期不能为空')
    } else {
      const dateObj = new Date(item.foundDate)
      if (isNaN(dateObj.getTime())) {
        errors.push('发现日期格式不正确')
      }
    }
    if (!item.healthStatus || !item.healthStatus.trim()) {
      errors.push('健康状况不能为空')
    }
    if (!item.description) {
      item.description = ''
    }
    if (!item.personality) {
      item.personality = ''
    }
    if (!item.stationId || !item.stationId.trim()) {
      errors.push('所属站点不能为空')
    } else {
      const stationExists = db.stations.some(s => s.id === item.stationId)
      if (!stationExists) {
        errors.push(`站点ID "${item.stationId}" 不存在`)
      }
    }

    return {
      ...item,
      rowIndex,
      errors,
      valid: errors.length === 0,
    }
  },

  batchCreate: (items: BatchAnimalImportItem[], createdBy: string = 'user-1'): BatchImportResult => {
    const importedAnimals: Animal[] = []
    const errors: { rowIndex: number; errors: string[] }[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const validated = animalRepository.validateImportItem(item, i + 1)

      if (!validated.valid) {
        errors.push({ rowIndex: i + 1, errors: validated.errors })
        continue
      }

      try {
        const photos: AnimalPhoto[] = (validated.photos || []).map((url, index) => ({
          id: generateId(),
          url,
          type: index === 0 ? 'found' : 'found',
          uploadedAt: new Date().toISOString(),
        }))

        const animal: Animal = {
          id: generateId(),
          name: validated.name,
          species: validated.species,
          breed: validated.breed || '未知',
          age: validated.age,
          gender: validated.gender,
          foundLocation: validated.foundLocation,
          foundDate: validated.foundDate,
          healthStatus: validated.healthStatus,
          description: validated.description || '',
          personality: validated.personality || '',
          status: 'rescued',
          stationId: validated.stationId,
          createdBy,
          photos,
          tnrProgress: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        db.animals.unshift(animal)
        importedAnimals.push(animal)
      } catch (e) {
        errors.push({
          rowIndex: i + 1,
          errors: [e instanceof Error ? e.message : '创建失败'],
        })
      }
    }

    const batchActivityId = generateId()
    db.batchImportActivities.unshift({
      id: batchActivityId,
      importedCount: importedAnimals.length,
      importedAt: new Date().toISOString(),
      importedBy: createdBy,
      animalIds: importedAnimals.map(a => a.id),
    })

    return {
      success: importedAnimals.length > 0,
      importedCount: importedAnimals.length,
      failedCount: errors.length,
      importedAnimals,
      errors,
      batchActivityId,
    }
  },

  getLifecycle: (animalId: string): LifecycleEvent[] => {
    const animal = db.animals.find(a => a.id === animalId)
    if (!animal) return []

    const events: LifecycleEvent[] = []

    events.push({
      id: generateId(),
      type: 'found',
      title: '发现流浪动物',
      description: `在${animal.foundLocation}发现${animal.name}`,
      date: animal.foundDate,
      photos: animal.photos.filter(p => p.type === 'found').map(p => p.url),
      operator: db.users.find(u => u.id === animal.createdBy)?.name,
    })

    const tnrOrder: Array<'trap' | 'neuter' | 'vaccine' | 'release'> = ['trap', 'neuter', 'vaccine', 'release']
    const tnrTitles = {
      trap: '诱捕成功',
      neuter: '绝育手术',
      vaccine: '免疫接种',
      release: '成功放归',
    }

    for (const type of tnrOrder) {
      const operation = animal.tnrProgress[type]
      if (operation) {
        events.push({
          id: generateId(),
          type,
          title: tnrTitles[type],
          description: operation.notes || `${tnrTitles[type]}操作完成`,
          date: operation.date,
          photos: operation.photos.map(p => p.url),
          operator: operation.operator,
        })
      }
    }

    if (animal.status === 'available') {
      events.push({
        id: generateId(),
        type: 'adoption_published',
        title: '发布待领养信息',
        description: `${animal.name}已完成TNR，正式发布待领养`,
        date: animal.updatedAt,
      })
    }

    const applications = db.applications.filter(a => a.animalId === animalId)
    for (const app of applications) {
      events.push({
        id: generateId(),
        type: 'application_submitted',
        title: '收到领养申请',
        description: `${app.applicantName}提交了领养申请`,
        date: app.createdAt,
      })

      if (app.status === 'approved' || app.status === 'completed') {
        events.push({
          id: generateId(),
          type: 'application_approved',
          title: '领养申请审核通过',
          description: app.reviewNotes || '申请已通过审核',
          date: app.reviewedAt || app.createdAt,
          operator: db.users.find(u => u.id === app.reviewedBy)?.name,
        })
      }
    }

    if (animal.adoptionInfo) {
      const agreement = db.agreements.find(a => a.id === animal.adoptionInfo!.agreementId)
      if (agreement) {
        events.push({
          id: generateId(),
          type: 'agreement_signed',
          title: '领养协议已签订',
          description: `${animal.adoptionInfo.adopterName}已签订领养协议`,
          date: agreement.signedAt,
        })
      }

      events.push({
        id: generateId(),
        type: 'adopted',
        title: '正式领养',
        description: `${animal.name}被${animal.adoptionInfo.adopterName}正式领养`,
        date: animal.adoptionInfo.adoptedAt,
      })
    }

    const followups = db.followups.filter(f => f.animalId === animalId && f.status !== 'pending')
    for (const followup of followups) {
      const periodLabels: Record<string, string> = {
        week1: '第1周',
        month1: '第1个月',
        month3: '第3个月',
        month6: '第6个月',
        year1: '第1年',
        yearly: '年度',
      }
      events.push({
        id: generateId(),
        type: 'followup',
        title: `${periodLabels[followup.period]}回访`,
        description: followup.description || '回访完成',
        date: followup.submittedAt || followup.scheduledDate,
        photos: followup.photos,
        operator: followup.adopterName,
      })
    }

    const transfers = db.transfers.filter(t => t.animalId === animalId && t.status !== 'pending')
    for (const transfer of transfers) {
      const fromStation = db.stations.find(s => s.id === transfer.fromStationId)
      const toStation = db.stations.find(s => s.id === transfer.toStationId)
      events.push({
        id: generateId(),
        type: 'transfer',
        title: '跨站调配',
        description: `从${fromStation?.name || '未知站点'}调配至${toStation?.name || '未知站点'}，原因：${transfer.reason}`,
        date: transfer.reviewedAt || transfer.createdAt,
      })
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  },
}
