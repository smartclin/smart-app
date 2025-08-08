'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import InfiniteScroll from '@/components/InfiniteScroll'
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_LIMIT } from '@/config'
import { useDebounce } from '@/hooks/use-debounce'
import { trpc } from '@/trpc/client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SearchChatListSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 px-2 pb-4'>
      {[...new Array(5)].fill(0).map((_) => (
        <Skeleton
          className='h-4 rounded-lg'
          key={null}
        />
      ))}
    </div>
  )
}
const SearchCommand = ({ open, onOpenChange }: Props) => {
  const scrollTargetRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 200)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.chats.search.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        query: debouncedQuery,
      },
      {
        getNextPageParam: (lastPage) => {
          const cursor = lastPage.nextCursor
          if (cursor?.id && cursor?.updatedAt) {
            return {
              id: cursor.id,
              updatedAt: cursor.updatedAt,
            }
          }
          return undefined
        },
        enabled: open,
      },
    )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [onOpenChange])

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <CommandInput
        onValueChange={setQuery}
        placeholder='Search your chats...'
        value={query}
      />
      <CommandList className='px-2 py-4'>
        <CommandEmpty>No chats found.</CommandEmpty>

        {isLoading && <SearchChatListSkeleton />}

        <div ref={scrollTargetRef}>
          {!isLoading &&
            data?.pages?.flatMap((page) =>
              page.chats.map((chat) => (
                <CommandItem
                  asChild
                  className='mt-2 h-8 cursor-pointer rounded-lg first:mt-0'
                  key={chat.id}
                  title={chat.title}
                  value={chat.title}
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    onClick={() => onOpenChange(false)}
                  >
                    {chat.title}
                  </Link>
                </CommandItem>
              )),
            )}
        </div>

        {!isLoading &&
          Array.isArray(data?.pages?.[0]?.chats) &&
          data.pages[0].chats.length > 0 &&
          hasNextPage && (
            <InfiniteScroll
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              targetRef={scrollTargetRef}
            />
          )}
      </CommandList>
    </CommandDialog>
  )
}

export default SearchCommand
