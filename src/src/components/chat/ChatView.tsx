'use client'

import { useChat } from '@ai-sdk/react'
import type { Message } from 'ai'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { useAutoResume } from '@/hooks/use-auto-resume'
import { useScrollMessages } from '@/hooks/use-scroll-messages'
import type { ModelId } from '@/lib/model/model'
import type { Tool } from '@/lib/tools/tool'
import { trpc } from '@/trpc/client'

import Messages from '../messages/Messages'
import ChatInput from './ChatInput'
import ChatSuggestions from './ChatSuggestions'
import ScrollToBottom from './ScrollToBottom'

interface Props {
	initialMessages: Message[]
	chatId: string
	selectedModel: ModelId
	selectedTool: Tool
}

const ChatView = ({ initialMessages, chatId, selectedModel, selectedTool }: Props) => {
	const router = useRouter()
	const pathname = usePathname()
	const utils = trpc.useUtils()

	const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

	const {
		input,
		handleInputChange,
		handleSubmit,
		status,
		setInput,
		messages,
		setMessages,
		data,
		experimental_resume,
	} = useChat({
		key: chatId,
		api: '/api/chat',
		id: chatId,
		initialMessages,
		experimental_prepareRequestBody({ messages, id }) {
			return {
				message: messages[messages.length - 1],
				id,
				model: selectedModel,
				tool: selectedTool,
				timezone: userTimeZone,
			}
		},
		generateId: () => uuidv4(),
		sendExtraMessageFields: true,
		experimental_throttle: 25,
		onResponse: response => {
			if (!response.ok) {
				toast.error('Failed to get response from AI')
			}
			utils.chats.getMany.invalidate()
		},
		onFinish: () => {
			utils.chats.getOne.invalidate({ chatId })
		},
		onError: error => {
			console.error(error.message)
			toast.error('Error generating response')
		},
	})

	useAutoResume({
		autoResume: true,
		initialMessages: initialMessages,
		experimental_resume,
		data,
		setMessages,
	})

	const isInitialLoad = pathname === `/chat/${chatId}`
	const isFirstTimeChat =
		initialMessages.length === 0 && messages.length <= 2 && pathname.startsWith('/chat')

	const { messagesContainerRef, lastMessageRef, showScrollButton, scrollToBottom, handleScroll } =
		useScrollMessages({
			messages,
			status,
			isInitialLoad,
			isFirstTimeChat,
		})

	const handleChatSubmit = () => {
		handleSubmit()
		if (messages.length === 0 && pathname === '/') {
			window.history.replaceState({}, '', `/chat/${chatId}`)
			router.push(`/chat/${chatId}`)
		}
	}

	const isHomepageWithNoMessages = messages.length === 0 && pathname === '/'

	return (
		<div className="flex flex-1 flex-col">
			{isHomepageWithNoMessages ? (
				<>
					<div className="hidden flex-1 flex-col items-center justify-center px-4 sm:flex">
						<div className="w-full max-w-3xl">
							<div className="mb-8 text-center">
								<h1 className="font-semibold text-4xl">How can I help you today?</h1>
							</div>

							<ChatInput
								handleInputChange={handleInputChange}
								handleSubmit={handleChatSubmit}
								initialModel={selectedModel}
								initialTool={selectedTool}
								input={input}
								isHomepageCentered={true}
								setInput={setInput}
								status={status}
							/>
							<ChatSuggestions setSuggestions={setInput} />
						</div>
					</div>

					<div className="flex h-full flex-col sm:hidden">
						<div className="flex flex-1 flex-col items-center justify-center px-4">
							<div className="mb-4 text-center">
								<h1 className="font-semibold text-2xl">How can I help you today?</h1>
							</div>
							<ChatSuggestions setSuggestions={setInput} />
						</div>
						<ChatInput
							handleInputChange={handleInputChange}
							handleSubmit={handleChatSubmit}
							initialModel={selectedModel}
							initialTool={selectedTool}
							input={input}
							isHomepageCentered={false}
							setInput={setInput}
							status={status}
						/>
					</div>
				</>
			) : (
				<>
					<div className="relative flex-1 overflow-hidden">
						<div
							className="hide-scrollbar absolute inset-0 overflow-y-auto scroll-smooth px-4 pb-20"
							onScroll={handleScroll}
							ref={messagesContainerRef}
						>
							<Messages
								lastMessageRef={lastMessageRef}
								messages={messages}
								status={status}
							/>
						</div>
						<ScrollToBottom
							onClick={scrollToBottom}
							show={showScrollButton}
						/>
					</div>
					<ChatInput
						handleInputChange={handleInputChange}
						handleSubmit={handleChatSubmit}
						initialModel={selectedModel}
						initialTool={selectedTool}
						input={input}
						isHomepageCentered={false}
						setInput={setInput}
						status={status}
					/>
				</>
			)}
		</div>
	)
}

export default ChatView
