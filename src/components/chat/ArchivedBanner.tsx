'use client';

import { IconRestore } from '@tabler/icons-react';
import { PanelLeft, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { trpc } from '@/trpc/client';

import { useSidebar } from '../ui/sidebar';

interface Props {
  chatId: string;
}

const ArchivedBanner = ({ chatId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { toggleSidebar } = useSidebar();

  const deleteChat = trpc.chats.deleteOne.useMutation({
    onSuccess: () => {
      toast.success('Chat Deleted');
      utils.chats.getMany.invalidate();
      router.push('/');
    },
    onError: error => {
      toast.error('Failed to delete chat', {
        description: error.message || 'Something went wrong. Please try again.'
      });
    }
  });

  const restoreChat = trpc.chats.restore.useMutation({
    onSuccess: data => {
      toast.success('Chat Restored');
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId: data.id });
    },
    onError: error => {
      toast.error('Failed to delete chat', {
        description: error.message || 'Something went wrong. Please try again.'
      });
    }
  });

  return (
    <div className='flex w-full items-center justify-between rounded-t-xl bg-destructive p-4'>
      <button
        className='w-fit rounded p-1 text-background text-sm transition duration-300 md:hover:bg-foreground/15'
        disabled={deleteChat.isPending}
        onClick={toggleSidebar}
        type='button'
      >
        <PanelLeft className='size-4' />
      </button>

      <div className='z-20 flex w-full items-center justify-center gap-5 text-center text-background text-sm dark:text-foreground'>
        This chat is currently archived
        <div className='items-centers flex flex-row gap-2'>
          <button
            className='w-fit rounded p-1 text-sm transition duration-300 md:hover:bg-foreground/15'
            disabled={restoreChat.isPending}
            onClick={() => restoreChat.mutate({ chatId })}
            type='button'
          >
            <IconRestore className='size-4' />
          </button>
          <button
            className='w-fit rounded p-1 text-sm transition duration-300 md:hover:bg-foreground/15'
            disabled={deleteChat.isPending}
            onClick={() => deleteChat.mutate({ chatId })}
            type='button'
          >
            <Trash2Icon className='size-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivedBanner;
