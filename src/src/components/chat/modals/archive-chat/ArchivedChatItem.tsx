'use client'

import { IconRestore, IconTrash } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import type { ChatGetOneOutput } from '@/types'

interface Props {
	chat: ChatGetOneOutput
	onOpenChange: (open: boolean) => void
}

const ArchivedChatItem = ({ chat, onOpenChange }: Props) => {
	const router = useRouter()

	const utils = trpc.useUtils()

	const deleteChat = trpc.chats.deleteOne.useMutation({
		onSuccess: () => {
			toast.success('Chat Deleted')
			utils.chats.getMany.invalidate()
			onOpenChange(false)
			router.push('/')
		},
		onError: error => {
			toast.error('Failed to delete chat', {
				description: error.message || 'Something went wrong. Please try again.',
			})
		},
	})

	const restoreChat = trpc.chats.restore.useMutation({
		onSuccess: data => {
			toast.success('Chat Restored')
			utils.chats.getMany.invalidate()
			utils.chats.getOne.invalidate({ chatId: data.id })
			onOpenChange(false)
		},
		onError: error => {
			toast.error('Failed to restore chat', {
				description: error.message || 'Something went wrong. Please try again.',
			})
		},
	})

	return (
		<div className="flex w-full items-center justify-between rounded-lg p-1 sm:pl-3 md:hover:bg-muted-foreground/5">
			<span>{chat?.title}</span>
			<div className="flex items-center gap-1">
				<Button
					disabled={restoreChat.isPending}
					onClick={() => {
						if (chat) {
							restoreChat.mutate({ chatId: chat?.id })
						}
					}}
					size="icon"
					variant="ghost"
				>
					<IconRestore />
				</Button>
				<Button
					disabled={deleteChat.isPending}
					onClick={() => {
						if (chat) {
							deleteChat.mutate({ chatId: chat.id })
						}
					}}
					size="icon"
					variant="ghost"
				>
					<IconTrash />
				</Button>
			</div>
		</div>
	)
}

export default ArchivedChatItem
