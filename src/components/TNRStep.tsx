import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TNRStepStatus = 'completed' | 'current' | 'pending'

export interface TNRStepProps {
  currentStep: 0 | 1 | 2 | 3
}

const steps = [
  { label: '诱捕', description: '捕捉流浪动物' },
  { label: '绝育', description: '进行绝育手术' },
  { label: '免疫', description: '接种疫苗' },
  { label: '放归', description: '放归原栖息地' },
]

export default function TNRStep({ currentStep }: TNRStepProps) {
  const getStatus = (index: number): TNRStepStatus => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'current'
    return 'pending'
  }

  return (
    <div className="w-full">
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.5s ease-out infinite;
        }
      `}</style>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStatus(index)
          const isLast = index === steps.length - 1

          return (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className="relative flex items-center justify-center">
                  {status === 'current' && (
                    <div className="absolute h-8 w-8 rounded-full bg-orange-400 animate-pulse-ring" />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                      status === 'completed' && 'border-green-500 bg-green-500',
                      status === 'current' && 'border-orange-500 bg-orange-500',
                      status === 'pending' && 'border-gray-300 bg-white',
                    )}
                  >
                    {status === 'completed' && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                    {status === 'current' && (
                      <div className="h-3 w-3 rounded-full bg-white" />
                    )}
                    {status === 'pending' && (
                      <div className="h-3 w-3 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'mx-2 h-1 flex-1 rounded-full transition-all duration-300',
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    status === 'completed' && 'text-green-600',
                    status === 'current' && 'text-orange-600',
                    status === 'pending' && 'text-gray-400',
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'mt-1 text-xs',
                    status === 'pending' ? 'text-gray-300' : 'text-gray-500',
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
