import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

function InfiniteScroll({
  targetRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}) {
  return (
    <div className='flex flex-col items-center gap-4'>
      <div
        className='h-1'
        ref={targetRef}
      />
      {hasNextPage ? (
        <Button
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={fetchNextPage}
          variant='ghost'
        >
          {isFetchingNextPage ? (
            <Loader2 className='size-4 animate-spin text-muted-foreground transition-all' />
          ) : (
            'Load More'
          )}
        </Button>
      ) : (
        <p className='text-muted-foreground text-sm'>No more items</p>
      )}
    </div>
  )
}

export default InfiniteScroll
