'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { chatRenameSchema } from '@/schemas'
import { trpc } from '@/trpc/client'
import type { ChatGetOneOutput } from '@/types'

import ResponsiveModal from './ResponsiveModal'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	onCancel: () => void
	chat: ChatGetOneOutput
}

const ChatRenameModal = ({ open, onOpenChange, onCancel, chat }: Props) => {
	const form = useForm<z.infer<typeof chatRenameSchema>>({
		resolver: zodResolver(chatRenameSchema),
		defaultValues: {
			title: chat?.title ?? '',
		},
	})

	const utils = trpc.useUtils()

	const rename = trpc.chats.rename.useMutation({
		onSuccess: data => {
			toast.success('Chat Renamed')
			utils.chats.getMany.invalidate()
			utils.chats.getOne.invalidate({ chatId: data.id })
			onCancel()
		},
		onError: error => {
			toast.error('Failed to rename chat', {
				description: error.message || 'Something went wrong. Please try again.',
			})
		},
	})

	const onSubmit = (values: z.infer<typeof chatRenameSchema>) => {
		const { title } = values
		if (chat) {
			rename.mutate({ chatId: chat?.id, title })
		}
	}

	const onCancelForm = () => {
		onCancel()
	}

	return (
		<ResponsiveModal
			onOpenChange={onOpenChange}
			open={open}
			title="Rename Chat"
		>
			<Form {...form}>
				<form
					className="space-y-5 max-md:p-5"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel>Enter new chat title</FormLabel>
								<FormControl>
									<Input
										{...field}
										className="text-sm placeholder:text-sm"
										placeholder="New Title"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="items-centers flex flex-col gap-2 md:flex-row md:justify-end">
						<Button
							className="w-full md:w-fit"
							onClick={onCancelForm}
							type="button"
							variant="secondary"
						>
							Cancel
						</Button>
						<Button
							className="w-full md:w-fit"
							disabled={rename.isPending}
							type="submit"
						>
							Rename
						</Button>
					</div>
				</form>
			</Form>
		</ResponsiveModal>
	)
}

export default ChatRenameModal
