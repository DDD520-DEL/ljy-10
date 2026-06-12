import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Cat, Dog, Heart, Calendar, Mars, Venus, Loader2, Filter } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { speciesLabels, genderLabels, type Animal, type Species } from '@/types'
import { cn } from '@/lib/utils'

const speciesOptions: { value: Species | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'dog', label: '狗狗' },
  { value: 'cat', label: '猫咪' },
  { value: 'other', label: '其他' },
]

function AnimalCard({ animal, onApply }: { animal: Animal; onApply: (id: string) => void }) {
  const photoUrl = animal.photos?.[0]?.url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rescue%20animal%20pet&image_size=square_hd'
  const genderIcon = animal.gender === 'male' ? <Mars className="h-4 w-4 text-blue-400" /> : <Venus className="h-4 w-4 text-pink-400" />
  const genderText = genderLabels[animal.gender]
  const speciesIcon = animal.species === 'dog' ? <Dog className="h-4 w-4" /> : animal.species === 'cat' ? <Cat className="h-4 w-4" /> : <Cat className="h-4 w-4" />

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative h-[60%] min-h-[280px] overflow-hidden">
        <img
          src={photoUrl}
          alt={animal.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2">
            {speciesIcon}
            <span className="text-sm font-medium">{speciesLabels[animal.species]}</span>
          </div>
          <h3 className="mt-2 text-2xl font-bold">{animal.name}</h3>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-600">
          待领养
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{animal.age}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {genderIcon}
            <span>{genderText}</span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-gray-500">{animal.personality || animal.description}</p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onApply(animal.id)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg"
        >
          <Heart className="h-5 w-5" />
          申请领养
        </button>
      </div>
    </div>
  )
}

export default function AdoptionCenter() {
  const navigate = useNavigate()
  const { availableAnimals, loading, fetchAvailableAnimals } = useAppStore()
  const [selectedSpecies, setSelectedSpecies] = useState<Species | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    const params: { species?: string; keyword?: string } = {}
    if (selectedSpecies !== 'all') params.species = selectedSpecies
    if (searchKeyword.trim()) params.keyword = searchKeyword.trim()
    fetchAvailableAnimals(params)
  }, [selectedSpecies, searchKeyword, fetchAvailableAnimals])

  const handleApply = (animalId: string) => {
    navigate(`/adoption/apply/${animalId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">领养中心</h1>
          <p className="mt-2 text-gray-600">用爱给它们一个温暖的家</p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {speciesOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSpecies(option.value)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    selectedSpecies === option.value
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索动物名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : availableAnimals.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white py-16 text-center">
            <Cat className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-600">暂无待领养动物</h3>
            <p className="mt-2 text-sm text-gray-400">请稍后再来看看吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} onApply={handleApply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
