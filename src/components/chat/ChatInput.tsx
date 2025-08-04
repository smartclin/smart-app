'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { ChatRequestOptions } from 'ai'
import { ArrowUp, X } from 'lucide-react'
import type React from 'react'
import { type ChangeEvent, startTransition, useEffect, useOptimistic } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { saveChatModelAsCookie } from '@/lib/model'
import { DEFAULT_MODEL_ID, type ModelId } from '@/lib/model/model'
import { saveToolAsCookie } from '@/lib/tools'
import { TOOL_REGISTRY, type Tool } from '@/lib/tools/tool'
import { cn } from '@/lib/utils'
import { chatInputSchema } from '@/schemas'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import ModelDropDown from './ModelDropDown'
import ToolDropDown from './ToolDropDown'

interface Props {
	suggestion?: string
	status?: 'streaming' | 'submitted' | 'ready' | 'error'
	input: string
	setInput: (value: string) => void
	handleSubmit: (
		event?: {
			preventDefault?: () => void
		},
		chatRequestOptions?: ChatRequestOptions,
	) => void
	handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void
	onSubmitPrompt?: (prompt: string) => void
	initialModel: ModelId
	initialTool: Tool
	isHomepageCentered?: boolean
}

const ChatInput = ({
	status,
	input,
	setInput,
	handleSubmit,
	handleInputChange,
	onSubmitPrompt,
	initialModel,
	initialTool,
	isHomepageCentered = false,
}: Props) => {
	const [optimisticTool, setOptimisticTool] = useOptimistic<Tool>(initialTool || 'none')

	const form = useForm<z.infer<typeof chatInputSchema>>({
		resolver: zodResolver(chatInputSchema),
		defaultValues: {
			prompt: '',
		},
	})

	const onSubmit = (values: z.infer<typeof chatInputSchema>) => {
		if (!values.prompt.trim()) return
		if (onSubmitPrompt) {
			onSubmitPrompt(values.prompt)
		} else {
			const syntheticEvent = {
				preventDefault: () => {},
				target: { value: values.prompt },
			}
			setInput(values.prompt)
			handleSubmit(syntheticEvent)
		}
	}

	useEffect(() => {
		if (input.length > 0) {
			form.setFocus('prompt')
		}
	}, [input, form])

	useEffect(() => {
		form.setValue('prompt', input)
	}, [input, form])

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		form.setValue('prompt', e.target.value)
		handleInputChange(e)
	}

	const handleRemoveCurrentTool = () => {
		startTransition(async () => {
			setOptimisticTool('none')
			await saveToolAsCookie('none')
			await saveChatModelAsCookie(DEFAULT_MODEL_ID)
		})
	}

	const isTool = optimisticTool !== 'none'
	const currentTool = optimisticTool === 'none' ? null : TOOL_REGISTRY[optimisticTool]

	return (
		<div
			className={cn(
				'z-20 w-full rounded-b-xl bg-background px-4',
				isHomepageCentered
					? 'relative' // Centered layout - no sticky positioning
					: 'sticky inset-x-0 bottom-0 pt-0', // Bottom layout - sticky positioning
			)}
		>
			<div className="relative mx-auto max-w-3xl">
				<Form {...form}>
					<form
						className="relative pb-4"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<div className="rounded-xl bg-background/80 shadow-xs outline-2 outline-muted-foreground/10 dark:shadow-none">
							<FormField
								control={form.control}
								name="prompt"
								render={({ field }) => (
									<FormItem className="gap-0">
										<FormControl>
											<Textarea
												className="max-h-32 w-full resize-none rounded-t-xl border-0 px-4 pt-4 pb-8 text-sm shadow-none placeholder:text-muted-foreground focus:outline-none focus:ring-0 max-md:placeholder:text-sm sm:text-base"
												{...field}
												disabled={status === 'streaming' || status === 'submitted'}
												onChange={handleTextareaChange}
												onKeyDown={e => {
													if (e.key === 'Enter' && !e.shiftKey) {
														e.preventDefault()
														form.handleSubmit(onSubmit)()
													}
												}}
												placeholder="Type your message here..."
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="flex items-center justify-between rounded-b-xl px-3 py-2.5 dark:bg-muted-foreground/7.5">
								<div className="flex items-center gap-1">
									<ModelDropDown
										currentTool={optimisticTool}
										disabled={isTool || status === 'streaming' || status === 'submitted'}
										initialModel={initialModel}
									/>
									<ToolDropDown
										disabledAll={status === 'streaming' || status === 'submitted'}
										initialModel={initialModel}
										optimisticTool={optimisticTool}
										setOptimisticTool={setOptimisticTool}
									/>
									{optimisticTool && optimisticTool !== 'none' && currentTool !== null && (
										<Button
											className="rounded-full max-md:text-xs"
											disabled={status === 'streaming' || status === 'submitted'}
											onClick={handleRemoveCurrentTool}
											size="sm"
											type="button"
											variant="secondary"
										>
											{<currentTool.icon />}
											<X className="size-3" />
										</Button>
									)}
								</div>
								<Button
									className="rounded-full bg-transparent"
									disabled={
										!form.watch('prompt')?.trim().length || (status && status === 'streaming')
									}
									size="icon"
									type="submit"
									variant="outline"
								>
									<ArrowUp />
									<span className="sr-only">Send message</span>
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	)
}

export default ChatInput
