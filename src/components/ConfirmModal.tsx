import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

const variantStyles = {
  danger: {
    icon: 'bg-red-100 text-red-600',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: 'bg-yellow-100 text-yellow-600',
    button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  default: {
    icon: 'bg-[#FED7AA] text-[#F97316]',
    button: 'bg-[#F97316] hover:bg-[#EA580C] focus:ring-[#F97316]',
  },
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[#A8A29E] hover:bg-[#F5F5F4] hover:text-[#57534E]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-start gap-4">
          <div className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
            styles.icon,
          )}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-lg font-semibold text-[#1C1917]">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-[#78716C]">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-medium text-[#57534E] hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              styles.button,
            )}
          >
            {loading ? '处理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
