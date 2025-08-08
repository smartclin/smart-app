import { TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'

export const ErrorCard = ({
  error,
  size = 'md',
  className,
}: {
  error: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ref?: React.Ref<HTMLDivElement>
}) => {
  return (
    <div
      className={cn(
        className,
        'my-4 rounded-lg border-[1px] border-red-500/30 bg-red-500/10 text-red-500 text-sm',
        {
          'p-2': size === 'sm',
          'p-4': size === 'md',
          'p-6': size === 'lg',
        },
      )}
    >
      <span className='flex items-center gap-2'>
        <TriangleAlert className='h-4 w-4' />
        {error}
      </span>
    </div>
  )
}
