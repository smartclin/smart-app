'use client';

import { RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

import ArchivedChatsModal from '../modals/archive-chat/ArchivedChatsModal';
import SearchCommand from '../modals/SearchCommand';

const SidebarUtils = () => {
  const router = useRouter();

  const [openArchivedChats, setOpenArchivedChats] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const { isMobile, setOpenMobile } = useSidebar();

  const handleChatClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }

    router.refresh();
  };

  return (
    <>
      <SearchCommand
        onOpenChange={setOpenSearch}
        open={openSearch}
      />
      <ArchivedChatsModal
        onOpenChange={setOpenArchivedChats}
        open={openArchivedChats}
      />

      <SidebarGroup>
        <SidebarGroupContent className='flex flex-col gap-2'>
          <Button
            asChild
            className='min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground'
          >
            <Link
              href='/'
              onClick={handleChatClick}
            >
              <span>New Chat</span>
            </Link>
          </Button>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className='gap-2'
                onClick={() => setOpenArchivedChats(true)}
              >
                <RefreshCw />
                <span className='font-medium'>Archived Chats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className='gap-2'
                onClick={() => setOpenSearch(true)}
              >
                <Search />
                <span className='font-medium'>Search Chats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default SidebarUtils;
