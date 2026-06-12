import { db, generateId, addDays, formatDate } from '../data/database.js'
import type {
  AdoptionApplication,
  CreateAdoptionApplicationRequest,
  ReviewApplicationRequest,
  AdoptionAgreement,
  CreateAgreementRequest,
  Animal,
} from '../types/index.js'

const generateAgreementContent = (app: AdoptionApplication, animal: Animal): string => {
  const station = db.stations.find(s => s.id === animal.stationId)
  const date = formatDate(new Date())

  return `领养协议

甲方（救助站）：${station?.name || '流浪动物救助站'}
乙方（领养人）：${app.applicantName}

鉴于乙方希望领养甲方救助的流浪动物"${animal.name}"（${animal.breed}，${animal.age}），双方达成以下协议：

1. 领养动物信息
   动物名称：${animal.name}
   物种：${animal.species === 'cat' ? '猫' : animal.species === 'dog' ? '狗' : '其他'}
   品种：${animal.breed}
   年龄：约${animal.age}
   性别：${animal.gender === 'male' ? '雄性' : animal.gender === 'female' ? '雌性' : '未知'}
   健康状况：${animal.healthStatus}

2. 甲方权利与义务
   2.1 甲方有权了解领养动物的生活状况和健康情况
   2.2 甲方有权在乙方违反协议时收回领养动物
   2.3 甲方应为乙方提供养宠咨询和必要的帮助

3. 乙方权利与义务
   3.1 乙方应爱护领养动物，不得虐待、遗弃
   3.2 乙方应科学喂养，定期为动物进行健康检查和免疫
   3.3 乙方应配合甲方的回访工作，按要求提交回访报告
   3.4 乙方如因特殊原因无法继续饲养，应及时通知甲方，不得私自转送
   3.5 乙方同意甲方在领养后1周、1个月、3个月、6个月、1年进行回访

4. 回访约定
   4.1 领养后第7天进行第一次回访
   4.2 领养后第1个月进行第二次回访
   4.3 领养后第3个月进行第三次回访
   4.4 领养后第6个月进行第四次回访
   4.5 领养后第1年进行第五次回访，之后每年一次

5. 违约责任
   5.1 如乙方虐待、遗弃领养动物，甲方有权无条件收回动物
   5.2 如乙方连续两次无故不提交回访报告，甲方有权收回动物

6. 其他约定
   6.1 本协议自双方签字之日起生效
   6.2 本协议一式两份，甲乙双方各执一份

甲方签字：${station?.name || '流浪动物救助站'}（盖章）
日期：${date}

乙方签字：____________________
日期：${date}`
}

const generateFollowups = (animalId: string, adopterId: string, adopterName: string, adoptDate: Date) => {
  const periods = [
    { period: 'week1' as const, days: 7 },
    { period: 'month1' as const, days: 30 },
    { period: 'month3' as const, days: 90 },
    { period: 'month6' as const, days: 180 },
    { period: 'year1' as const, days: 365 },
  ]

  for (const p of periods) {
    db.followups.push({
      id: generateId(),
      animalId,
      adopterId,
      adopterName,
      scheduledDate: formatDate(addDays(adoptDate, p.days)),
      period: p.period,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
  }
}

export const adoptionRepository = {
  findApplications: (filters?: { status?: string; stationId?: string }) => {
    let applications = [...db.applications]

    if (filters?.status) {
      applications = applications.filter(a => a.status === filters.status)
    }
    if (filters?.stationId) {
      applications = applications.filter(a => {
        const animal = db.animals.find(an => an.id === a.animalId)
        return animal?.stationId === filters.stationId
      })
    }

    return applications.map(app => ({
      ...app,
      animal: db.animals.find(a => a.id === app.animalId),
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  findApplicationById: (id: string) => {
    const app = db.applications.find(a => a.id === id)
    if (!app) return undefined
    return {
      ...app,
      animal: db.animals.find(a => a.id === app.animalId),
    }
  },

  createApplication: (data: CreateAdoptionApplicationRequest): AdoptionApplication => {
    const application: AdoptionApplication = {
      id: generateId(),
      ...data,
      applicantId: 'user-4',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    db.applications.unshift(application)
    return application
  },

  reviewApplication: (id: string, data: ReviewApplicationRequest): AdoptionApplication | undefined => {
    const app = db.applications.find(a => a.id === id)
    if (!app) return undefined

    app.status = data.status
    app.reviewNotes = data.reviewNotes
    app.reviewedBy = 'user-1'
    app.reviewedAt = new Date().toISOString()

    if (data.status === 'approved') {
      const animal = db.animals.find(a => a.id === app.animalId)
      if (animal) {
        animal.status = 'available'
        animal.updatedAt = new Date().toISOString()
      }
    }

    return app
  },

  findAgreementByApplicationId: (applicationId: string) => {
    return db.agreements.find(a => a.applicationId === applicationId)
  },

  createAgreement: (data: CreateAgreementRequest): AdoptionAgreement | undefined => {
    const app = db.applications.find(a => a.id === data.applicationId)
    if (!app) return undefined

    const animal = db.animals.find(a => a.id === app.animalId)
    if (!animal) return undefined

    const agreement: AdoptionAgreement = {
      id: generateId(),
      applicationId: data.applicationId,
      content: generateAgreementContent(app, animal),
      signature: data.signature,
      signedAt: data.signedAt,
      createdAt: new Date().toISOString(),
    }

    db.agreements.push(agreement)

    app.status = 'completed'

    animal.status = 'adopted'
    animal.adoptionInfo = {
      applicationId: app.id,
      adopterId: app.applicantId,
      adopterName: app.applicantName,
      adoptedAt: data.signedAt,
      agreementId: agreement.id,
    }
    animal.updatedAt = new Date().toISOString()

    generateFollowups(animal.id, app.applicantId, app.applicantName, new Date(data.signedAt))

    return agreement
  },
}
