import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  PenLine,
  Check,
  Loader2,
  Cat,
  Dog,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { speciesLabels, genderLabels } from '@/types'
import { cn } from '@/lib/utils'

const agreementContent = `
领养协议书

甲方（救助方）：流浪动物救助站
地址：___________________________
联系电话：_______________________

乙方（领养方）：_________________
身份证号：_______________________
联系电话：_______________________
电子邮箱：_______________________
联系地址：_______________________

鉴于乙方希望领养甲方救助的流浪动物，双方经友好协商，达成如下协议：

第一条 领养动物信息
1. 动物名称：_________________
2. 物种：_________________
3. 品种：_________________
4. 年龄：_________________
5. 性别：_________________
6. 健康状况：已完成必要的免疫和绝育手术

第二条 乙方的权利与义务
1. 乙方应向甲方提供真实的个人信息和居住条件证明。
2. 乙方承诺将领养的动物作为家庭伴侣饲养，不得用于任何商业目的或其他不当用途。
3. 乙方应为领养的动物提供适宜的居住环境、充足的食物和清洁的饮水。
4. 乙方应定期带领养的动物进行健康检查和疫苗接种，如发现动物生病应及时就医。
5. 乙方不得虐待、遗弃领养的动物，不得擅自将动物转让或转卖。
6. 乙方应配合甲方的回访工作，如实提供领养动物的生活状况。
7. 如乙方因特殊原因确实无法继续饲养领养的动物，应及时通知甲方，由甲方协助妥善处理，不得私自处理。

第三条 甲方的权利与义务
1. 甲方应向乙方如实告知领养动物的健康状况、性格特点等信息。
2. 甲方有权在领养后对乙方的饲养情况进行回访和监督。
3. 如发现乙方存在虐待、遗弃动物或其他违反本协议的行为，甲方有权收回领养的动物。
4. 甲方应为乙方提供必要的养宠咨询和指导。

第四条 回访安排
1. 领养后第1周：首次回访，了解动物适应情况
2. 领养后第1个月：第二次回访，检查健康状况
3. 领养后第3个月：第三次回访，评估饲养情况
4. 领养后第6个月：第四次回访，确认长期适应
5. 领养后第1年：年度回访，建立长期档案
6. 之后每年进行一次年度回访

第五条 违约责任
1. 如乙方违反本协议约定，甲方有权收回领养的动物，并要求乙方赔偿相关损失。
2. 如因乙方饲养不当造成动物伤害或死亡，乙方应承担相应责任。

第六条 协议的生效与终止
1. 本协议自双方签字之日起生效。
2. 本协议一式两份，甲乙双方各执一份，具有同等法律效力。
3. 如遇不可抗力或其他特殊情况，双方可协商解除本协议。

第七条 其他约定
1. 本协议未尽事宜，双方可另行协商并签订补充协议。
2. 如因本协议发生争议，双方应友好协商解决；协商不成的，可向甲方所在地人民法院提起诉讼。

（以下为签字栏）

甲方（盖章）：_________________
代表签字：_________________
日期：______年______月______日

乙方（签字）：_________________
日期：______年______月______日
`

export default function AdoptionAgreement() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { currentApplication, loading, fetchApplicationById, createAgreement, updateAnimal } = useAppStore()
  const [signature, setSignature] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (applicationId) {
      fetchApplicationById(applicationId)
    }
  }, [applicationId, fetchApplicationById])

  const handleSubmit = async () => {
    if (!signature.trim() || !agreed || !currentApplication || !applicationId) return

    try {
      await createAgreement({
        applicationId,
        content: agreementContent,
        signature,
      })

      if (currentApplication.animalId) {
        await updateAnimal(currentApplication.animalId, {
          status: 'adopted',
          adoptionInfo: {
            applicationId,
            adopterId: currentApplication.applicantId,
            adopterName: currentApplication.applicantName,
            adoptedAt: new Date().toISOString(),
            agreementId: applicationId,
          },
        })
      }

      setSubmitted(true)
      setTimeout(() => {
        navigate('/adoption/followup')
      }, 3000)
    } catch (error) {
      console.error('签订协议失败:', error)
    }
  }

  const animalPhoto = currentApplication?.animal?.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">协议签订成功！</h2>
          <p className="mt-2 text-gray-600">恭喜您，领养手续已完成</p>
          <p className="mt-4 text-sm text-gray-500">系统已自动生成回访计划</p>
          <p className="mt-2 text-sm text-gray-400">3秒后跳转到回访日历...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">领养协议</h1>

        {currentApplication?.animal && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">领养动物信息</h3>
            <div className="flex items-center gap-4">
              <img
                src={animalPhoto}
                alt={currentApplication.animal.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{currentApplication.animal.name}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    {currentApplication.animal.species === 'dog' ? <Dog className="h-4 w-4" /> : <Cat className="h-4 w-4" />}
                    {speciesLabels[currentApplication.animal.species]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {currentApplication.animal.age}
                  </span>
                  <span>{currentApplication.animal.breed}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">请仔细阅读协议内容</p>
              <p className="mt-1">本协议具有法律效力，请确保您已理解并同意所有条款。</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative rounded-lg border-4 p-8 shadow-lg',
            'bg-[#fef7e6] border-amber-200',
            'before:absolute before:inset-2 before:rounded before:border-2 before:border-amber-300/50'
          )}
        >
          <div className="relative">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900">领养协议书</h2>
              <p className="mt-1 text-sm text-amber-700">编号：{applicationId}</p>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-2 text-sm leading-relaxed text-amber-900/80">
              <div className="whitespace-pre-line font-serif">
                {agreementContent
                  .replace('_________________', currentApplication?.applicantName || '_________________')
                  .replace('_________________', currentApplication?.applicantPhone || '_________________')
                  .replace('_________________', currentApplication?.applicantEmail || '_________________')
                  .replace('_________________', currentApplication?.address || '_________________')
                  .replace('_________________', currentApplication?.animal?.name || '_________________')
                  .replace('_________________', currentApplication?.animal ? speciesLabels[currentApplication.animal.species] : '_________________')
                  .replace('_________________', currentApplication?.animal?.breed || '_________________')
                  .replace('_________________', currentApplication?.animal?.age || '_________________')
                  .replace('_________________', currentApplication?.animal ? genderLabels[currentApplication.animal.gender] : '_________________')}
              </div>
            </div>

            <div className="mt-8 space-y-6 border-t-2 border-amber-300/50 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-amber-800">甲方：流浪动物救助站</p>
                  <p className="mt-1 text-sm text-amber-700">代表签字：_________________</p>
                  <p className="mt-1 text-sm text-amber-700">日期：{today}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">乙方（领养人）</p>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <PenLine className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-amber-700">签名：</span>
                    </div>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="请在此处签名"
                      className="mt-2 w-full border-b-2 border-amber-300 bg-transparent py-2 text-lg font-medium text-amber-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="mt-2 text-sm text-amber-700">日期：{today}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentApplication && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">回访计划</h3>
            <div className="space-y-3">
              {[
                { period: '第1周', desc: '首次回访，了解动物适应情况' },
                { period: '第1个月', desc: '第二次回访，检查健康状况' },
                { period: '第3个月', desc: '第三次回访，评估饲养情况' },
                { period: '第6个月', desc: '第四次回访，确认长期适应' },
                { period: '第1年', desc: '年度回访，建立长期档案' },
                { period: '每年', desc: '年度回访，持续关注' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.period}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              我已仔细阅读并同意以上协议条款，承诺将善待领养的动物，遵守协议中的所有约定。
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!signature.trim() || !agreed || loading}
            className={cn(
              'mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white transition-all duration-200',
              signature.trim() && agreed && !loading
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg'
                : 'cursor-not-allowed bg-gray-300'
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <PenLine className="h-5 w-5" />
                确认签订协议
              </>
            )}
          </button>
        </div>

        {currentApplication && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">申请人信息</h3>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4 text-gray-400" />
                <span>{currentApplication.applicantName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{currentApplication.applicantPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{currentApplication.applicantEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>{currentApplication.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
