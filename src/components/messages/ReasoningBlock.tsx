'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Lightbulb } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { MemoizedMarkdown } from './MemoizedMarkdown'
import { SpinnerIcon } from './SpinnerIcon'

interface Props {
	reasoning: string
	isStreaming?: boolean
}

const ReasoningBlock = ({ reasoning, isStreaming = false }: Props) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const formatReasoningSteps = (text: string) => {
		// Split reasoning into logical steps/paragraphs
		const steps = text.split('\n\n').filter(step => step.trim())
		return steps
	}

	const reasoningSteps = formatReasoningSteps(reasoning)

	return (
		<div className="mb-10 min-h-[20px] w-full rounded-none bg-transparent pl-0 transition">
			<div className="px-0">
				<div className="flex items-center gap-2 font-medium text-base">
					{isStreaming ? (
						<div className="flex items-center gap-2 text-sm">
							<div className="animate-spin transition">
								<SpinnerIcon />
							</div>
							<span>Thinking</span>
						</div>
					) : (
						<div className="flex items-center gap-2 text-sm">
							<Lightbulb className="size-4" />
							<span>Thought for some time</span>
						</div>
					)}
				</div>
				<Button
					className="mt-1 h-auto w-fit rounded-sm py-1 pl-0 text-muted-foreground text-sm hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
					onClick={() => setIsExpanded(!isExpanded)}
					size="icon"
					variant="ghost"
				>
					<ChevronRight
						className={cn(
							'size-4 transition-transform duration-200 ease-in-out',
							isExpanded && 'rotate-90',
						)}
					/>
					{isExpanded ? (
						<>Hide reasoning steps</>
					) : (
						<>Show reasoning steps ({reasoningSteps.length} steps)</>
					)}
				</Button>
			</div>

			{isExpanded && (
				<motion.div
					animate={{
						height: 'auto',
						opacity: 1,
						filter: 'blur(0px)',
					}}
					initial={{
						height: 0,
						opacity: 0,
						filter: 'blur(4px)',
					}}
					style={{ overflow: 'hidden' }}
					transition={{
						height: {
							duration: 0.2,
							ease: [0.04, 0.62, 0.23, 0.98],
						},
						opacity: {
							duration: 0.25,
							ease: 'easeInOut',
						},
						filter: {
							duration: 0.2,
							ease: 'easeInOut',
						},
					}}
				>
					<div className="mt-4 border-muted-foreground/20 border-l p-2">
						<div>
							{reasoningSteps.map((step, index) => (
								<motion.div
									animate={{
										opacity: 1,
										y: 0,
									}}
									className={cn('px-4 py-2')}
									initial={{
										opacity: 0,
										y: 5,
									}}
									key={step}
									transition={{
										duration: 0.2,
										delay: index * 0.05,
										ease: 'easeOut',
									}}
								>
									<MemoizedMarkdown
										className="text-sm italic leading-relaxed"
										content={step.trim()}
										id={`reasoning-step-${index}`}
									/>
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>
			)}
		</div>
	)
}

export default ReasoningBlock
