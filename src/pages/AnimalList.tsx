import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, X, Cat, Dog, Bird } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import AnimalCard from '@/components/AnimalCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  statusLabels,
  speciesLabels,
  type AnimalStatus,
  type Species,
} from '@/types'

const speciesIcons: Record<string, typeof Cat> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  other: Cat,
}

export default function AnimalList() {
  const navigate = useNavigate()
  const { loading, animals, stations, fetchAnimals, fetchStations } = useAppStore()

  const [statusFilter, setStatusFilter] = useState<AnimalStatus | ''>('')
  const [speciesFilter, setSpeciesFilter] = useState<Species | ''>('')
  const [stationFilter, setStationFilter] = useState<string>('')
  const [keyword, setKeyword] = useState<string>('')

  useEffect(() => {
    fetchAnimals()
    fetchStations()
  }, [fetchAnimals, fetchStations])

  const handleSearch = () => {
    const params: {
      status?: string
      species?: string
      stationId?: string
      keyword?: string
    } = {}
    if (statusFilter) params.status = statusFilter
    if (speciesFilter) params.species = speciesFilter
    if (stationFilter) params.stationId = stationFilter
    if (keyword.trim()) params.keyword = keyword.trim()
    fetchAnimals(params)
  }

  const handleReset = () => {
    setStatusFilter('')
    setSpeciesFilter('')
    setStationFilter('')
    setKeyword('')
    fetchAnimals()
  }

  const adaptedAnimals = useMemo(() => {
    return animals.map((animal) => {
      const photoUrl =
        animal.photos.find((p) => p.type === 'found')?.url ||
        animal.photos[0]?.url ||
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20stray%20cat%20or%20dog%20portrait%20animal%20rescue&image_size=square'

      const SpeciesIcon = speciesIcons[animal.species] || Cat

      return {
        id: animal.id,
        name: animal.name,
        photo: photoUrl,
        status: (animal.status === 'available'
          ? 'available'
          : animal.status === 'adopted'
            ? 'adopted'
            : animal.status === 'tnr_in_progress' || animal.status === 'rescued'
              ? 'treatment'
              : 'pending') as 'available' | 'pending' | 'adopted' | 'treatment',
        species: animal.species as 'cat' | 'dog' | 'bird' | 'rabbit' | 'other',
        age: animal.age,
        gender: animal.gender === 'unknown' ? 'male' : animal.gender,
        SpeciesIcon,
      }
    })
  }, [animals])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#78716C]" />
              <span className="text-sm font-medium text-[#44403C]">筛选条件</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AnimalStatus | '')}
              className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#44403C] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
            >
              <option value="">全部状态</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value as Species | '')}
              className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#44403C] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
            >
              <option value="">全部物种</option>
              {Object.entries(speciesLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#44403C] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
            >
              <option value="">全部站点</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索动物名称、品种..."
                className="w-full rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] py-2 pl-10 pr-4 text-sm text-[#44403C] placeholder:text-[#A8A29E] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
            >
              搜索
            </button>

            <button
              onClick={handleReset}
              className="rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#44403C] transition-colors hover:bg-[#F5F5F4]"
            >
              重置
            </button>
          </div>

          {(statusFilter || speciesFilter || stationFilter || keyword) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F5F5F4]">
              <span className="text-xs text-[#A8A29E]">已选筛选：</span>
              {statusFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {statusLabels[statusFilter]}
                  <button onClick={() => setStatusFilter('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {speciesFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {speciesLabels[speciesFilter]}
                  <button onClick={() => setSpeciesFilter('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {stationFilter && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  {stations.find((s) => s.id === stationFilter)?.name}
                  <button onClick={() => setStationFilter('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1C1917]">
          动物列表 <span className="text-sm font-normal text-[#78716C]">共 {animals.length} 条记录</span>
        </h2>
        <button
          onClick={() => navigate('/animals/new')}
          className="flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
        >
          <Plus className="h-4 w-4" />
          新增动物
        </button>
      </div>

      {adaptedAnimals.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adaptedAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              id={animal.id}
              name={animal.name}
              photo={animal.photo}
              status={animal.status}
              species={animal.species}
              age={animal.age}
              gender={animal.gender}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Cat className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">暂无动物数据</p>
          <button
            onClick={() => navigate('/animals/new')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]"
          >
            <Plus className="h-4 w-4" />
            新增第一条动物记录
          </button>
        </div>
      )}
    </div>
  )
}
