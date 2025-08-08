'use client';

import { useRef } from 'react';

import InfiniteScroll from '@/components/InfiniteScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_LIMIT } from '@/config';
import { trpc } from '@/trpc/client';

import ArchivedChatItem from './ArchivedChatItem';

const ArchivedChatListSkeleton = () => (
  <div className='flex flex-col gap-2'>
    {Array.from({ length: 5 }).map(_ => (
      <div
        className='flex flex-col'
        key={null}
      >
        <Skeleton className='h-1 rounded-md' />
        <Skeleton className='h-4 rounded' />
      </div>
    ))}
  </div>
);

interface Props {
  onOpenChange: (open: boolean) => void;
}

const ArchivedChatList = ({ onOpenChange }: Props) => {
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.chats.getMany.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        isArchived: true
      },
      {
        getNextPageParam: lastPage => {
          const cursor = lastPage.nextCursor;
          return cursor?.id && cursor?.updatedAt
            ? { id: cursor.id, updatedAt: cursor.updatedAt }
            : null;
        }
      }
    );

  const merged = {
    today: data?.pages.flatMap(p => p.chats.today) ?? [],
    last7Days: data?.pages.flatMap(p => p.chats.last7Days) ?? [],
    older: data?.pages.flatMap(p => p.chats.older) ?? []
  };

  const noChats =
    !isLoading &&
    merged.today.length === 0 &&
    merged.last7Days.length === 0 &&
    merged.older.length === 0;

  return (
    <div
      className='flex flex-col gap-4 py-4 max-md:px-4'
      ref={scrollTargetRef}
    >
      {isLoading && <ArchivedChatListSkeleton />}

      {noChats && (
        <p className='p-4 pt-0 text-center text-muted-foreground text-sm'>No archived Chats</p>
      )}

      {merged.today.length > 0 && (
        <div className='flex flex-col'>
          <span className='font-semibold text-sm'>Today</span>
          <div className='mt-2 flex flex-col gap-2'>
            {merged.today.map(chat => (
              <ArchivedChatItem
                chat={chat}
                key={chat.id}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {merged.last7Days.length > 0 && (
        <div className='flex flex-col'>
          <span className='font-semibold text-sm'>Last 7 Days</span>
          <div className='mt-2 flex flex-col gap-2'>
            {merged.last7Days.map(chat => (
              <ArchivedChatItem
                chat={chat}
                key={chat.id}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {merged.older.length > 0 && (
        <div className='flex flex-col'>
          <span className='font-semibold text-sm'>Older</span>
          <div className='mt-2 flex flex-col gap-2'>
            {merged.older.map(chat => (
              <ArchivedChatItem
                chat={chat}
                key={chat.id}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && hasNextPage && (
        <InfiniteScroll
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          targetRef={scrollTargetRef}
        />
      )}
    </div>
  );
};

export default ArchivedChatList;
