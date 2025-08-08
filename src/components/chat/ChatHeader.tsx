'use client';

import { useParams } from 'next/navigation';

import { SidebarTrigger } from '@/components/ui/sidebar';

import { ModeToggle } from '../theme/mode-toggle';
import ShareButton from './ShareButton';

const ChatHeader = () => {
  const { chatId } = useParams();
  const chatIdString = typeof chatId === 'string' ? chatId : undefined;

  return (
    <header className='sticky top-0 z-20 flex h-[--header-height] shrink-0 items-center gap-2 rounded-t-xl border-b backdrop-blur-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]'>
      <div className='flex w-full items-center gap-1 px-4 py-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <div className='ml-auto flex items-center gap-2'>
          <ModeToggle />
          {chatId && <ShareButton chatId={chatIdString} />}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
