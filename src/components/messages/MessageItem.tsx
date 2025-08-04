'use client'

import type { Message } from 'ai'

import { cn } from '@/lib/utils'

import ImageDisplay from './ImageDisplay'
import LoadingSkeleton from './LoadingSkeleton'
import { MemoizedMarkdown } from './MemoizedMarkdown'
import ReasoningBlock from './ReasoningBlock'
import WeatherCard from './WeatherCard'
import WebSearchCard from './WebSearch'

interface Props {
	message: Message
	status: 'streaming' | 'submitted' | 'ready' | 'error'
}

const MessageItem = ({ message, status }: Props) => {
	const isUser = message.role === 'user'

	return (
		<div className={cn('w-full', isUser && 'flex justify-end')}>
			<div
				className={cn(
					'whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm sm:text-[15px]',
					isUser
						? 'max-w-[300px] break-words bg-muted-foreground/10 md:max-w-md lg:max-w-xl'
						: 'w-full break-words bg-transparent',
				)}
			>
				{message.parts?.map((part, index) => {
					const { type } = part
					const key = `message-${message.id}-part-${index}`
					if (part.type === 'reasoning') {
						return (
							<div
								className="mb-4"
								key={key}
							>
								<ReasoningBlock
									isStreaming={
										// @ts-expect-error export ReasoningUIPart
										status === 'streaming' && index === message.parts.length - 1
									}
									reasoning={part.reasoning as string}
								/>
							</div>
						)
					}
					if (type === 'tool-invocation') {
						const { toolInvocation } = part
						const { toolName, toolCallId, state } = toolInvocation

						if (state === 'partial-call') {
							return (
								<div
									className="mt-3"
									key={toolCallId}
								>
									{toolName === 'generateImageTool' ? (
										<p className="text-sm sm:text-[15px]">Generating Image</p>
									) : toolName === 'webSearchTool' ? (
										<p className="text-sm sm:text-[15px]">Searching the web</p>
									) : toolName === 'getWeatherTool' ? (
										<p className="text-sm sm:text-[15px]">Getting weather data</p>
									) : null}
								</div>
							)
						}

						if (state === 'call') {
							return (
								<div
									className="mt-3"
									key={toolCallId}
								>
									{toolName === 'generateImageTool' ? (
										<LoadingSkeleton type="image" />
									) : toolName === 'webSearchTool' ? (
										<LoadingSkeleton type="web-search" />
									) : toolName === 'getWeatherTool' ? (
										<LoadingSkeleton type="weather" />
									) : null}
								</div>
							)
						}

						if (state === 'result') {
							const { result } = toolInvocation
							return (
								<div
									className="mt-3"
									key={toolCallId}
								>
									{toolName === 'generateImageTool' ? (
										<ImageDisplay
											imageUrl={result.imageUrl}
											prompt={result.prompt}
										/>
									) : toolName === 'webSearchTool' ? (
										<WebSearchCard
											query={toolInvocation.args.query}
											results={result}
										/>
									) : toolName === 'getWeatherTool' ? (
										<WeatherCard data={result} />
									) : null}
								</div>
							)
						}
					}

					return null
				})}

				{/* display text content */}
				{message.content &&
					(isUser ? (
						message.content
					) : (
						<MemoizedMarkdown
							content={message.content}
							id={message.id}
						/>
					))}
			</div>
		</div>
	)
}

export default MessageItem
