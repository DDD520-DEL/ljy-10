import { useState } from 'react'
import { X, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PhotoTag = 'all' | 'preoperative' | 'postoperative' | 'adopted' | 'rescue'

export interface PhotoItem {
  id: string
  url: string
  title: string
  tag: Exclude<PhotoTag, 'all'>
  height?: number
}

export interface PhotoWallProps {
  photos: PhotoItem[]
}

const tagLabels: Record<PhotoTag, string> = {
  all: '全部',
  preoperative: '术前',
  postoperative: '术后',
  adopted: '已领养',
  rescue: '救援',
}

const tagColors: Record<Exclude<PhotoTag, 'all'>, string> = {
  preoperative: 'bg-orange-100 text-orange-700',
  postoperative: 'bg-green-100 text-green-700',
  adopted: 'bg-blue-100 text-blue-700',
  rescue: 'bg-red-100 text-red-700',
}

export default function PhotoWall({ photos }: PhotoWallProps) {
  const [activeTag, setActiveTag] = useState<PhotoTag>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)

  const filteredPhotos = activeTag === 'all'
    ? photos
    : photos.filter((photo) => photo.tag === activeTag)

  const tags: PhotoTag[] = ['all', 'preoperative', 'postoperative', 'adopted', 'rescue']

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              activeTag === tag
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tag !== 'all' && <Tag className="h-3.5 w-3.5" />}
            {tagLabels[tag]}
          </button>
        ))}
      </div>

      <div
        className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4"
        style={{ columnGap: '1rem' }}
      >
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="relative group">
              <img
                src={photo.url}
                alt={photo.title}
                className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ height: photo.height ? `${photo.height}px` : 'auto' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-1 text-xs font-medium',
                    tagColors[photo.tag],
                  )}
                >
                  {tagLabels[photo.tag]}
                </span>
                <p className="mt-2 text-sm font-medium text-white line-clamp-1">
                  {photo.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[80vh] w-auto object-contain"
            />
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPhoto.title}
                </h3>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    tagColors[selectedPhoto.tag],
                  )}
                >
                  {tagLabels[selectedPhoto.tag]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
