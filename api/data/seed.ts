import { db, generateId, formatDate, addDays } from './database.js'
import type {
  Station,
  User,
  Animal,
  TNROperation,
  AnimalPhoto,
  AdoptionApplication,
  Followup,
  AnimalTransfer,
  AdoptionAgreement,
} from '../types/index.js'

const catImages = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop',
]

const dogImages = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=300&fit=crop',
]

const createPhoto = (url: string, type: AnimalPhoto['type'], caption?: string): AnimalPhoto => ({
  id: generateId(),
  url,
  type,
  caption,
  uploadedAt: new Date().toISOString(),
})

const createTNROperation = (
  type: TNROperation['type'],
  date: string,
  photos: AnimalPhoto[],
  location?: string,
  hospital?: string,
): TNROperation => ({
  id: generateId(),
  type,
  date,
  location,
  hospital,
  operator: '张医生',
  cost: type === 'neuter' ? 300 : type === 'vaccine' ? 80 : 50,
  notes: `完成${type === 'trap' ? '诱捕' : type === 'neuter' ? '绝育手术' : type === 'vaccine' ? '免疫接种' : '放归'}操作`,
  photos,
  createdAt: new Date().toISOString(),
})

export const seedDatabase = (): void => {
  const now = new Date()

  db.stations = [
    {
      id: 'station-1',
      name: '阳光流浪动物救助站',
      address: '北京市朝阳区阳光路88号',
      phone: '010-12345678',
      email: 'sunny@example.com',
      capacity: 100,
      description: '成立于2018年，专注于流浪动物TNR和领养服务',
      createdAt: formatDate(addDays(now, -365 * 3)),
    },
    {
      id: 'station-2',
      name: '爱心之家救助中心',
      address: '北京市海淀区爱心路123号',
      phone: '010-87654321',
      email: 'lovehome@example.com',
      capacity: 80,
      description: '由志愿者自发组织的非营利性救助机构',
      createdAt: formatDate(addDays(now, -365 * 2)),
    },
    {
      id: 'station-3',
      name: '希望动物救助站',
      address: '北京市丰台区希望路66号',
      phone: '010-55667788',
      email: 'hope@example.com',
      capacity: 120,
      description: '致力于流浪动物的救助、治疗和领养',
      createdAt: formatDate(addDays(now, -365)),
    },
  ] as Station[]

  db.users = [
    {
      id: 'user-1',
      name: '王站长',
      email: 'wang@sunny.com',
      phone: '13800138001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
      role: 'admin',
      stationId: 'station-1',
      createdAt: formatDate(addDays(now, -365 * 2)),
    },
    {
      id: 'user-2',
      name: '李医生',
      email: 'li@sunny.com',
      phone: '13800138002',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff1',
      role: 'staff',
      stationId: 'station-1',
      createdAt: formatDate(addDays(now, -365)),
    },
    {
      id: 'user-3',
      name: '张志愿者',
      email: 'zhang@lovehome.com',
      phone: '13800138003',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff2',
      role: 'staff',
      stationId: 'station-2',
      createdAt: formatDate(addDays(now, -200)),
    },
    {
      id: 'user-4',
      name: '陈领养人',
      email: 'chen@email.com',
      phone: '13900139001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=adopter1',
      role: 'adopter',
      createdAt: formatDate(addDays(now, -180)),
    },
    {
      id: 'user-5',
      name: '刘志愿者',
      email: 'liu@email.com',
      phone: '13600136001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=volunteer1',
      role: 'volunteer',
      createdAt: formatDate(addDays(now, -100)),
    },
    {
      id: 'user-6',
      name: '赵领养人',
      email: 'zhao@email.com',
      phone: '13700137001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=adopter2',
      role: 'adopter',
      createdAt: formatDate(addDays(now, -60)),
    },
  ] as User[]

  const baseAnimals: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: '橘子',
      species: 'cat',
      breed: '橘猫',
      age: '2岁',
      gender: 'male',
      foundLocation: '朝阳区某小区垃圾桶旁',
      foundDate: formatDate(addDays(now, -90)),
      healthStatus: '健康，已驱虫',
      description: '一只非常亲人的橘猫，喜欢撒娇',
      personality: '活泼、亲人、贪吃',
      status: 'available',
      stationId: 'station-1',
      createdBy: 'user-2',
      photos: [
        createPhoto(catImages[0], 'found', '发现时的照片'),
        createPhoto(catImages[0], 'adoption', '待领养照片'),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -88)), [createPhoto(catImages[1], 'found', '诱捕现场')], '朝阳区某小区'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -85)), [createPhoto(catImages[2], 'pre_surgery', '术前'), createPhoto(catImages[2], 'post_surgery', '术后')], undefined, '阳光宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -80)), [createPhoto(catImages[3], 'vaccine', '疫苗接种')], undefined, '阳光宠物医院'),
      },
    },
    {
      name: '小黑',
      species: 'dog',
      breed: '中华田园犬',
      age: '1岁',
      gender: 'female',
      foundLocation: '海淀区公园长椅下',
      foundDate: formatDate(addDays(now, -60)),
      healthStatus: '轻微皮肤病，正在治疗中',
      description: '性格温顺的小黑狗，被遗弃在公园',
      personality: '安静、温顺、忠诚',
      status: 'tnr_in_progress',
      stationId: 'station-2',
      createdBy: 'user-3',
      photos: [
        createPhoto(dogImages[0], 'found', '发现时的照片'),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -58)), [createPhoto(dogImages[1], 'found', '诱捕成功')], '海淀区公园'),
      },
    },
    {
      name: '花花',
      species: 'cat',
      breed: '三花猫',
      age: '3岁',
      gender: 'female',
      foundLocation: '丰台区菜市场附近',
      foundDate: formatDate(addDays(now, -120)),
      healthStatus: '非常健康',
      description: '已经完成TNR的三花猫，非常适合领养',
      personality: '独立、爱干净、安静',
      status: 'adopted',
      stationId: 'station-3',
      createdBy: 'user-2',
      photos: [
        createPhoto(catImages[1], 'found', '发现时'),
        createPhoto(catImages[1], 'adoption', '领养照片'),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -118)), [createPhoto(catImages[2], 'found', '')], '丰台区菜市场'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -115)), [createPhoto(catImages[3], 'pre_surgery', ''), createPhoto(catImages[3], 'post_surgery', '')], undefined, '希望宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -110)), [createPhoto(catImages[4], 'vaccine', '')], undefined, '希望宠物医院'),
        release: createTNROperation('release', formatDate(addDays(now, -100)), [createPhoto(catImages[0], 'release', '放归后观察')], '原发现地附近'),
      },
      adoptionInfo: {
        applicationId: 'app-1',
        adopterId: 'user-4',
        adopterName: '陈领养人',
        adoptedAt: formatDate(addDays(now, -30)),
        agreementId: 'agreement-1',
      },
    },
    {
      name: '大黄',
      species: 'dog',
      breed: '金毛串串',
      age: '4岁',
      gender: 'male',
      foundLocation: '朝阳区建筑工地',
      foundDate: formatDate(addDays(now, -150)),
      healthStatus: '健康，体型壮硕',
      description: '体型较大但性格温顺，需要活动空间',
      personality: '活泼、友善、喜欢运动',
      status: 'available',
      stationId: 'station-1',
      createdBy: 'user-2',
      photos: [
        createPhoto(dogImages[1], 'found', '发现时'),
        createPhoto(dogImages[1], 'adoption', '待领养'),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -148)), [createPhoto(dogImages[2], 'found', '')], '朝阳区工地'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -145)), [createPhoto(dogImages[3], 'pre_surgery', ''), createPhoto(dogImages[3], 'post_surgery', '')], undefined, '阳光宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -140)), [createPhoto(dogImages[4], 'vaccine', '')], undefined, '阳光宠物医院'),
      },
    },
    {
      name: '小白',
      species: 'cat',
      breed: '白猫',
      age: '6个月',
      gender: 'unknown',
      foundLocation: '海淀区大学校园',
      foundDate: formatDate(addDays(now, -30)),
      healthStatus: '健康，幼猫',
      description: '校园里发现的小奶猫，正在寻找领养',
      personality: '好奇、爱玩、黏人',
      status: 'rescued',
      stationId: 'station-2',
      createdBy: 'user-5',
      photos: [
        createPhoto(catImages[2], 'found', '发现时的小奶猫'),
      ],
      tnrProgress: {},
    },
    {
      name: '阿黄',
      species: 'dog',
      breed: '柴犬串串',
      age: '2岁',
      gender: 'male',
      foundLocation: '丰台区地铁站口',
      foundDate: formatDate(addDays(now, -200)),
      healthStatus: '健康',
      description: '聪明伶俐，已完成全部TNR流程',
      personality: '聪明、机警、活泼',
      status: 'tnr_completed',
      stationId: 'station-3',
      createdBy: 'user-3',
      photos: [
        createPhoto(dogImages[2], 'found', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -198)), [createPhoto(dogImages[3], 'found', '')], '丰台地铁站'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -195)), [createPhoto(dogImages[4], 'pre_surgery', ''), createPhoto(dogImages[4], 'post_surgery', '')], undefined, '希望宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -190)), [createPhoto(dogImages[0], 'vaccine', '')], undefined, '希望宠物医院'),
        release: createTNROperation('release', formatDate(addDays(now, -180)), [createPhoto(dogImages[1], 'release', '')], '原发现地'),
      },
    },
    {
      name: '奶牛',
      species: 'cat',
      breed: '奶牛猫',
      age: '1.5岁',
      gender: 'male',
      foundLocation: '朝阳区写字楼楼下',
      foundDate: formatDate(addDays(now, -75)),
      healthStatus: '健康',
      description: '黑白相间的奶牛猫，性格活泼',
      personality: '活泼、调皮、黏人',
      status: 'available',
      stationId: 'station-1',
      createdBy: 'user-2',
      photos: [
        createPhoto(catImages[3], 'found', ''),
        createPhoto(catImages[3], 'adoption', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -73)), [createPhoto(catImages[4], 'found', '')], '朝阳写字楼'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -70)), [createPhoto(catImages[0], 'pre_surgery', ''), createPhoto(catImages[0], 'post_surgery', '')], undefined, '阳光宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -65)), [createPhoto(catImages[1], 'vaccine', '')], undefined, '阳光宠物医院'),
      },
    },
    {
      name: '豆豆',
      species: 'dog',
      breed: '博美串串',
      age: '3岁',
      gender: 'female',
      foundLocation: '海淀区商场门口',
      foundDate: formatDate(addDays(now, -100)),
      healthStatus: '健康，已绝育',
      description: '小巧可爱的狗狗，非常适合家养',
      personality: '温顺、黏人、爱撒娇',
      status: 'adopted',
      stationId: 'station-2',
      createdBy: 'user-3',
      photos: [
        createPhoto(dogImages[3], 'found', ''),
        createPhoto(dogImages[3], 'adoption', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -98)), [createPhoto(dogImages[4], 'found', '')], '海淀商场'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -95)), [createPhoto(dogImages[0], 'pre_surgery', ''), createPhoto(dogImages[0], 'post_surgery', '')], undefined, '爱心宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -90)), [createPhoto(dogImages[1], 'vaccine', '')], undefined, '爱心宠物医院'),
      },
      adoptionInfo: {
        applicationId: 'app-2',
        adopterId: 'user-6',
        adopterName: '赵领养人',
        adoptedAt: formatDate(addDays(now, -15)),
        agreementId: 'agreement-2',
      },
    },
    {
      name: '灰灰',
      species: 'cat',
      breed: '灰猫',
      age: '2.5岁',
      gender: 'female',
      foundLocation: '丰台区老城区',
      foundDate: formatDate(addDays(now, -80)),
      healthStatus: '健康',
      description: '优雅的灰色猫咪，性格独立',
      personality: '独立、优雅、安静',
      status: 'released',
      stationId: 'station-3',
      createdBy: 'user-3',
      photos: [
        createPhoto(catImages[4], 'found', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -78)), [createPhoto(catImages[0], 'found', '')], '丰台老城区'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -75)), [createPhoto(catImages[1], 'pre_surgery', ''), createPhoto(catImages[1], 'post_surgery', '')], undefined, '希望宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -70)), [createPhoto(catImages[2], 'vaccine', '')], undefined, '希望宠物医院'),
        release: createTNROperation('release', formatDate(addDays(now, -60)), [createPhoto(catImages[3], 'release', '放归后状态良好')], '原发现地'),
      },
    },
    {
      name: '旺财',
      species: 'dog',
      breed: '拉布拉多串串',
      age: '5岁',
      gender: 'male',
      foundLocation: '朝阳区高速公路边',
      foundDate: formatDate(addDays(now, -45)),
      healthStatus: '腿部有旧伤，已治愈',
      description: '经历过苦难但依然信任人类的狗狗',
      personality: '忠诚、温顺、感恩',
      status: 'tnr_in_progress',
      stationId: 'station-1',
      createdBy: 'user-5',
      photos: [
        createPhoto(dogImages[4], 'found', '发现时受伤的样子'),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -43)), [createPhoto(dogImages[0], 'found', '')], '高速路边'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -40)), [createPhoto(dogImages[1], 'pre_surgery', ''), createPhoto(dogImages[1], 'post_surgery', '')], undefined, '阳光宠物医院'),
      },
    },
    {
      name: '咪咪',
      species: 'cat',
      breed: '狸花猫',
      age: '8个月',
      gender: 'female',
      foundLocation: '海淀区居民区',
      foundDate: formatDate(addDays(now, -25)),
      healthStatus: '健康',
      description: '可爱的狸花妹妹，活泼好动',
      personality: '活泼、好动、好奇',
      status: 'rescued',
      stationId: 'station-2',
      createdBy: 'user-3',
      photos: [
        createPhoto(catImages[0], 'found', ''),
      ],
      tnrProgress: {},
    },
    {
      name: '毛球',
      species: 'other',
      breed: '兔子',
      age: '1岁',
      gender: 'unknown',
      foundLocation: '朝阳区公园',
      foundDate: formatDate(addDays(now, -50)),
      healthStatus: '健康',
      description: '被遗弃的宠物兔，非常可爱',
      personality: '胆小、可爱、爱吃',
      status: 'available',
      stationId: 'station-1',
      createdBy: 'user-2',
      photos: [
        createPhoto('https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop', 'found', ''),
        createPhoto('https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop', 'adoption', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -48)), [], '朝阳公园'),
      },
    },
    {
      name: '乖乖',
      species: 'cat',
      breed: '长毛猫',
      age: '4岁',
      gender: 'female',
      foundLocation: '丰台区医院附近',
      foundDate: formatDate(addDays(now, -130)),
      healthStatus: '健康，毛发需定期梳理',
      description: '美丽的长毛猫，性格乖巧',
      personality: '乖巧、安静、黏人',
      status: 'transferred',
      stationId: 'station-2',
      createdBy: 'user-3',
      photos: [
        createPhoto(catImages[1], 'found', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -128)), [createPhoto(catImages[2], 'found', '')], '丰台医院'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -125)), [createPhoto(catImages[3], 'pre_surgery', ''), createPhoto(catImages[3], 'post_surgery', '')], undefined, '爱心宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -120)), [createPhoto(catImages[4], 'vaccine', '')], undefined, '爱心宠物医院'),
      },
    },
    {
      name: '乐乐',
      species: 'dog',
      breed: '泰迪串串',
      age: '2岁',
      gender: 'male',
      foundLocation: '海淀区地铁站',
      foundDate: formatDate(addDays(now, -55)),
      healthStatus: '健康',
      description: '活泼好动的小泰迪',
      personality: '活泼、好动、聪明',
      status: 'available',
      stationId: 'station-2',
      createdBy: 'user-3',
      photos: [
        createPhoto(dogImages[1], 'found', ''),
        createPhoto(dogImages[1], 'adoption', ''),
      ],
      tnrProgress: {
        trap: createTNROperation('trap', formatDate(addDays(now, -53)), [createPhoto(dogImages[2], 'found', '')], '海淀地铁站'),
        neuter: createTNROperation('neuter', formatDate(addDays(now, -50)), [createPhoto(dogImages[3], 'pre_surgery', ''), createPhoto(dogImages[3], 'post_surgery', '')], undefined, '爱心宠物医院'),
        vaccine: createTNROperation('vaccine', formatDate(addDays(now, -45)), [createPhoto(dogImages[4], 'vaccine', '')], undefined, '爱心宠物医院'),
      },
    },
    {
      name: '小橘',
      species: 'cat',
      breed: '橘猫',
      age: '3个月',
      gender: 'male',
      foundLocation: '朝阳区小区绿化带',
      foundDate: formatDate(addDays(now, -15)),
      healthStatus: '健康，幼猫',
      description: '小奶橘，正在等待妈妈或领养',
      personality: '可爱、黏人、爱睡觉',
      status: 'rescued',
      stationId: 'station-1',
      createdBy: 'user-5',
      photos: [
        createPhoto(catImages[2], 'found', '可怜的小奶猫'),
      ],
      tnrProgress: {},
    },
  ]

  db.animals = baseAnimals.map((animal, index) => ({
    ...animal,
    id: `animal-${index + 1}`,
    createdAt: formatDate(addDays(now, -(150 - index * 10))),
    updatedAt: formatDate(addDays(now, -(10 - index))),
  })) as Animal[]

  db.applications = [
    {
      id: 'app-1',
      animalId: 'animal-3',
      applicantId: 'user-4',
      applicantName: '陈领养人',
      applicantPhone: '13900139001',
      applicantEmail: 'chen@email.com',
      address: '北京市朝阳区幸福小区1号楼101室',
      housingType: '自有住房',
      petExperience: '曾经养过猫，有5年养猫经验',
      familySituation: '三口之家，孩子10岁，全家人都喜欢动物',
      reason: '我家孩子一直想要一只猫，花花的性格很适合我们家',
      documents: [],
      status: 'completed',
      reviewNotes: '申请人条件优秀，家中环境适合养猫，批准领养',
      reviewedBy: 'user-1',
      reviewedAt: formatDate(addDays(now, -35)),
      createdAt: formatDate(addDays(now, -40)),
    },
    {
      id: 'app-2',
      animalId: 'animal-8',
      applicantId: 'user-6',
      applicantName: '赵领养人',
      applicantPhone: '13700137001',
      applicantEmail: 'zhao@email.com',
      address: '北京市海淀区温馨花园3号楼202室',
      housingType: '租赁住房，房东允许养宠',
      petExperience: '目前养着一只仓鼠，有照顾小动物的经验',
      familySituation: '单身，与室友合租，室友也同意养狗',
      reason: '豆豆太可爱了，我一直想养一只小型犬',
      documents: [],
      status: 'completed',
      reviewNotes: '申请人虽然是租房，但提供了房东同意书，工作稳定，批准领养',
      reviewedBy: 'user-3',
      reviewedAt: formatDate(addDays(now, -20)),
      createdAt: formatDate(addDays(now, -25)),
    },
    {
      id: 'app-3',
      animalId: 'animal-1',
      applicantId: 'user-4',
      applicantName: '陈领养人',
      applicantPhone: '13900139001',
      applicantEmail: 'chen@email.com',
      address: '北京市朝阳区幸福小区1号楼101室',
      housingType: '自有住房',
      petExperience: '已经领养了花花，有经验',
      familySituation: '三口之家，希望给花花找个伴',
      reason: '想给花花找个橘猫作伴',
      documents: [],
      status: 'pending',
      createdAt: formatDate(addDays(now, -5)),
    },
    {
      id: 'app-4',
      animalId: 'animal-4',
      applicantId: 'user-6',
      applicantName: '赵领养人',
      applicantPhone: '13700137001',
      applicantEmail: 'zhao@email.com',
      address: '北京市海淀区温馨花园3号楼202室',
      housingType: '租赁住房，房东允许养宠',
      petExperience: '已经领养了豆豆，有养狗经验',
      familySituation: '单身，有足够时间照顾大型犬',
      reason: '大黄的性格很吸引我，我有足够的空间和时间照顾它',
      documents: [],
      status: 'pending',
      createdAt: formatDate(addDays(now, -3)),
    },
    {
      id: 'app-5',
      animalId: 'animal-7',
      applicantId: 'user-4',
      applicantName: '陈领养人',
      applicantPhone: '13900139001',
      applicantEmail: 'chen@email.com',
      address: '北京市朝阳区幸福小区1号楼101室',
      housingType: '自有住房',
      petExperience: '有养猫经验',
      familySituation: '三口之家',
      reason: '奶牛猫太可爱了，想领养',
      documents: [],
      status: 'rejected',
      reviewNotes: '短期内申请次数过多，建议先适应第一只猫的生活',
      reviewedBy: 'user-1',
      reviewedAt: formatDate(addDays(now, -2)),
      createdAt: formatDate(addDays(now, -8)),
    },
  ] as AdoptionApplication[]

  db.agreements = [
    {
      id: 'agreement-1',
      applicationId: 'app-1',
      content: `领养协议

甲方（救助站）：阳光流浪动物救助站
乙方（领养人）：陈领养人

鉴于乙方希望领养甲方救助的流浪动物"花花"（三花猫，3岁），双方达成以下协议：

1. 领养动物信息
   动物名称：花花
   物种：猫
   品种：三花猫
   年龄：约3岁
   性别：雌性
   健康状况：已完成绝育、免疫

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

甲方签字：阳光流浪动物救助站（盖章）
日期：${formatDate(addDays(now, -30))}

乙方签字：____________________
日期：${formatDate(addDays(now, -30))}`,
      signature: '陈领养人',
      signedAt: formatDate(addDays(now, -30)),
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'agreement-2',
      applicationId: 'app-2',
      content: `领养协议

甲方（救助站）：爱心之家救助中心
乙方（领养人）：赵领养人

鉴于乙方希望领养甲方救助的流浪动物"豆豆"（博美串串，3岁），双方达成以下协议：

1. 领养动物信息
   动物名称：豆豆
   物种：狗
   品种：博美串串
   年龄：约3岁
   性别：雌性
   健康状况：已完成绝育、免疫

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

甲方签字：爱心之家救助中心（盖章）
日期：${formatDate(addDays(now, -15))}

乙方签字：____________________
日期：${formatDate(addDays(now, -15))}`,
      signature: '赵领养人',
      signedAt: formatDate(addDays(now, -15)),
      createdAt: formatDate(addDays(now, -15)),
    },
  ] as AdoptionAgreement[]

  db.followups = [
    {
      id: 'followup-1',
      animalId: 'animal-3',
      adopterId: 'user-4',
      adopterName: '陈领养人',
      scheduledDate: formatDate(addDays(now, -23)),
      period: 'week1',
      status: 'approved',
      photos: [catImages[3]],
      healthStatus: '非常好，能吃能睡',
      description: '花花适应得很好，已经完全不害怕了，每天都很活泼',
      issues: '无',
      submittedAt: formatDate(addDays(now, -23)),
      reviewNotes: '适应良好，继续保持',
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'followup-2',
      animalId: 'animal-3',
      adopterId: 'user-4',
      adopterName: '陈领养人',
      scheduledDate: formatDate(addDays(now, 0)),
      period: 'month1',
      status: 'pending',
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'followup-3',
      animalId: 'animal-3',
      adopterId: 'user-4',
      adopterName: '陈领养人',
      scheduledDate: formatDate(addDays(now, 60)),
      period: 'month3',
      status: 'pending',
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'followup-4',
      animalId: 'animal-3',
      adopterId: 'user-4',
      adopterName: '陈领养人',
      scheduledDate: formatDate(addDays(now, 150)),
      period: 'month6',
      status: 'pending',
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'followup-5',
      animalId: 'animal-3',
      adopterId: 'user-4',
      adopterName: '陈领养人',
      scheduledDate: formatDate(addDays(now, 335)),
      period: 'year1',
      status: 'pending',
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'followup-6',
      animalId: 'animal-8',
      adopterId: 'user-6',
      adopterName: '赵领养人',
      scheduledDate: formatDate(addDays(now, -8)),
      period: 'week1',
      status: 'submitted',
      photos: [dogImages[4]],
      healthStatus: '很好，食欲旺盛',
      description: '豆豆非常聪明，已经学会了坐下和握手，每天都会带它出去遛两次',
      issues: '偶尔会在晚上叫几声，还在训练中',
      submittedAt: formatDate(addDays(now, -8)),
      createdAt: formatDate(addDays(now, -15)),
    },
    {
      id: 'followup-7',
      animalId: 'animal-8',
      adopterId: 'user-6',
      adopterName: '赵领养人',
      scheduledDate: formatDate(addDays(now, 15)),
      period: 'month1',
      status: 'pending',
      createdAt: formatDate(addDays(now, -15)),
    },
    {
      id: 'followup-8',
      animalId: 'animal-8',
      adopterId: 'user-6',
      adopterName: '赵领养人',
      scheduledDate: formatDate(addDays(now, 75)),
      period: 'month3',
      status: 'pending',
      createdAt: formatDate(addDays(now, -15)),
    },
    {
      id: 'followup-9',
      animalId: 'animal-3',
      adopterId: 'user-4',
      adopterName: '陈领养人',
      scheduledDate: formatDate(addDays(now, -3)),
      period: 'month1',
      status: 'overdue',
      createdAt: formatDate(addDays(now, -30)),
    },
    {
      id: 'followup-10',
      animalId: 'animal-8',
      adopterId: 'user-6',
      adopterName: '赵领养人',
      scheduledDate: formatDate(addDays(now, 5)),
      period: 'month1',
      status: 'pending',
      createdAt: formatDate(addDays(now, -15)),
    },
  ] as Followup[]

  db.transfers = [
    {
      id: 'transfer-1',
      animalId: 'animal-13',
      fromStationId: 'station-3',
      toStationId: 'station-2',
      reason: '本站点容量已满，爱心之家有合适的领养人资源',
      status: 'completed',
      reviewNotes: '同意调配，希望乖乖能找到好人家',
      reviewedAt: formatDate(addDays(now, -10)),
      createdAt: formatDate(addDays(now, -15)),
    },
    {
      id: 'transfer-2',
      animalId: 'animal-6',
      fromStationId: 'station-3',
      toStationId: 'station-1',
      reason: '阳光救助站有更多大型犬的领养需求，阿黄在那边更容易被领养',
      status: 'pending',
      createdAt: formatDate(addDays(now, -3)),
    },
    {
      id: 'transfer-3',
      animalId: 'animal-10',
      fromStationId: 'station-1',
      toStationId: 'station-3',
      reason: '希望救助站有专业的腿部康复设备，能更好地照顾旺财',
      status: 'pending',
      createdAt: formatDate(addDays(now, -1)),
    },
  ] as AnimalTransfer[]
}

seedDatabase()
