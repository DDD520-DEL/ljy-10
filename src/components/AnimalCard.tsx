import { useNavigate } from 'react-router-dom'
import { Cat, Dog, Bird, Rabbit, Calendar, Mars, Venus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnimalCardProps {
  id: string
  name: string
  photo: string
  status: 'available' | 'pending' | 'adopted' | 'treatment'
  species: 'cat' | 'dog' | 'bird' | 'rabbit' | 'other'
  age: string
  gender: 'male' | 'female'
}

const statusConfig = {
  available: { label: '待领养', className: 'bg-green-100 text-green-700' },
  pending: { label: '待审核', className: 'bg-yellow-100 text-yellow-700' },
  adopted: { label: '已领养', className: 'bg-blue-100 text-blue-700' },
  treatment: { label: '治疗中', className: 'bg-red-100 text-red-700' },
}

const speciesIcons = {
  cat: Cat,
  dog: Dog,
  bird: Bird,
  rabbit: Rabbit,
  other: Cat,
}

export default function AnimalCard({
  id, name, photo, status, species, age, gender }: AnimalCardProps) {
  const navigate = useNavigate()
  const SpeciesIcon = speciesIcons[species]
  const statusInfo = statusConfig[status]

  const handleClick = () => {
    navigate(`/animal/${id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
      )}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              statusInfo.className,
            )}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <SpeciesIcon className="h-4 w-4" />
            <span className="capitalize">{species === 'other' ? '其他' : species === 'cat' ? '猫' : species === 'dog' ? '狗' : species === 'bird' ? '鸟' : '兔'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{age}</span>
          </div>
          <div className="flex items-center gap-1">
            {gender === 'male' ? (
              <Mars className="h-4 w-4 text-blue-500" />
            ) : (
              <Venus className="h-4 w-4 text-pink-500" />
            )}
            <span>{gender === 'male' ? '公' : '母'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
