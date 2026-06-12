import { db } from '../data/database.js'
import type { DashboardStats, RecentActivity } from '../types/index.js'

export const dashboardService = {
  getStats: (): DashboardStats => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const totalAnimals = db.animals.length
    const availableForAdoption = db.animals.filter(a => a.status === 'available').length
    const tnrInProgress = db.animals.filter(a => a.status === 'tnr_in_progress').length

    const followupsThisMonth = db.followups.filter(f => {
      const date = new Date(f.scheduledDate)
      return date >= thisMonthStart && date <= thisMonthEnd
    }).length

    const pendingApplications = db.applications.filter(a => a.status === 'pending').length
    const overdueFollowups = db.followups.filter(f => {
      const scheduled = new Date(f.scheduledDate)
      return f.status === 'pending' && scheduled < now
    }).length
    const pendingTransfers = db.transfers.filter(t => t.status === 'pending').length

    return {
      totalAnimals,
      availableForAdoption,
      tnrInProgress,
      followupsThisMonth,
      pendingApplications,
      overdueFollowups,
      pendingTransfers,
    }
  },

  getRecentActivities: (): RecentActivity[] => {
    const activities: RecentActivity[] = []
    const importedAnimalIds = new Set<string>()

    for (const batch of db.batchImportActivities.slice(0, 3)) {
      const importer = db.users.find(u => u.id === batch.importedBy)
      const sampleAnimal = batch.animalIds.length > 0
        ? db.animals.find(a => a.id === batch.animalIds[0])
        : undefined

      batch.animalIds.forEach(id => importedAnimalIds.add(id))

      activities.push({
        id: `activity-batch-${batch.id}`,
        type: 'batch_import',
        title: `批量导入：${batch.importedCount}只流浪动物`,
        description: `${importer?.name || '系统用户'} 批量导入了 ${batch.importedCount} 只动物${sampleAnimal ? `，包括${sampleAnimal.name}等` : ''}`,
        date: batch.importedAt,
      })
    }

    for (const animal of db.animals.filter(a => !importedAnimalIds.has(a.id)).slice(0, 5)) {
      activities.push({
        id: `activity-${animal.id}`,
        type: 'animal',
        title: `新动物登记：${animal.name}`,
        description: `${animal.species === 'cat' ? '猫咪' : animal.species === 'dog' ? '狗狗' : '其他'}，${animal.breed}`,
        date: animal.createdAt,
        animalId: animal.id,
      })
    }

    for (const app of db.applications.filter(a => a.status === 'pending').slice(0, 3)) {
      const animal = db.animals.find(a => a.id === app.animalId)
      activities.push({
        id: `activity-${app.id}`,
        type: 'application',
        title: '新领养申请',
        description: `${app.applicantName} 申请领养 ${animal?.name || '未知动物'}`,
        date: app.createdAt,
        animalId: app.animalId,
      })
    }

    for (const followup of db.followups.filter(f => f.status === 'submitted').slice(0, 3)) {
      const animal = db.animals.find(a => a.id === followup.animalId)
      activities.push({
        id: `activity-${followup.id}`,
        type: 'followup',
        title: '回访报告待审核',
        description: `${followup.adopterName} 提交了 ${animal?.name || '未知动物'} 的回访报告`,
        date: followup.submittedAt || followup.createdAt,
        animalId: followup.animalId,
      })
    }

    for (const transfer of db.transfers.filter(t => t.status === 'pending').slice(0, 2)) {
      const fromStation = db.stations.find(s => s.id === transfer.fromStationId)
      const toStation = db.stations.find(s => s.id === transfer.toStationId)
      const animal = db.animals.find(a => a.id === transfer.animalId)
      activities.push({
        id: `activity-${transfer.id}`,
        type: 'transfer',
        title: '跨站调配请求',
        description: `${fromStation?.name || '未知站点'} → ${toStation?.name || '未知站点'}：${animal?.name || '未知动物'}`,
        date: transfer.createdAt,
        animalId: transfer.animalId,
      })
    }

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  },
}
