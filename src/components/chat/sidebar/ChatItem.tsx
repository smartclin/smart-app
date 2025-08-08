'use client'

import { IconDots, IconTrash } from '@tabler/icons-react'
import { Edit, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/trpc/client'
import type { ChatGetOneOutput } from '@/types'

import ChatRenameModal from '../modals/ChatRenameModal'
import DeleteChatModal from '../modals/DeleteChatModal'

export const ChatItemSkeleton = () => {
  return <Skeleton className='h-6 w-full rounded-md' />
}

interface Props {
  chat: ChatGetOneOutput
}

const ChatItem = ({ chat }: Props) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openRenameModal, setOpenRenameModal] = useState(false)
  const { isMobile, setOpenMobile } = useSidebar()

  const pathname = usePathname()
  const router = useRouter()

  const utils = trpc.useUtils()
  const archiveChat = trpc.chats.archive.useMutation({
    onSuccess: () => {
      toast.success('Chat Archived')
      utils.chats.getMany.invalidate()
      router.push('/')
    },
    onError: (error) => {
      toast.error('Failed to archive chat', {
        description: error.message || 'Something went wrong. Please try again.',
      })
    },
  })

  const handleChatClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <>
      <ChatRenameModal
        chat={chat}
        onCancel={() => setOpenRenameModal(false)}
        onOpenChange={setOpenRenameModal}
        open={openRenameModal}
      />
      <DeleteChatModal
        chatId={chat.id}
        onCancel={() => setOpenDeleteModal(false)}
        onOpenChange={setOpenDeleteModal}
        open={openDeleteModal}
      />
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === `/chat/${chat.id}`}
        >
          <Link
            className='truncate'
            href={`/chat/${chat.id}`}
            onClick={handleChatClick}
          >
            {chat.title}
          </Link>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className='rounded-sm data-[state=open]:bg-accent'
              showOnHover
            >
              <IconDots />
              <span className='sr-only'>More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isMobile ? 'end' : 'start'}
            className='w-24 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
          >
            <DropdownMenuItem
              onClick={() => {
                archiveChat.mutate({ chatId: chat.id })
              }}
            >
              <RefreshCcw />
              <span>Archive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenRenameModal(true)}>
              <Edit />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpenDeleteModal(true)}
              variant='destructive'
            >
              <IconTrash />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </>
  )
}

export default ChatItem
