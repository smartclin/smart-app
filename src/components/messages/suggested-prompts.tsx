'use client'

import { motion } from 'motion/react'
import { memo } from 'react'

import { Button } from '../ui/button'

interface SuggestedPromptsProps {
	sendMessage: (input: string) => void
}

function PureSuggestedPrompts({ sendMessage }: SuggestedPromptsProps) {
	const suggestedActions = [
		{
			title: 'What are the advantages',
			label: 'of using Next.js?',
			action: 'What are the advantages of using Next.js?',
		},
		{
			title: 'What is the weather',
			label: 'in San Francisco?',
			action: 'What is the weather in San Francisco?',
		},
	]

	return (
		<div
			className="grid w-full gap-2 sm:grid-cols-2"
			data-testid="suggested-actions"
		>
			{suggestedActions.map((suggestedAction, index) => (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className={index > 1 ? 'hidden sm:block' : 'block'}
					exit={{ opacity: 0, y: 20 }}
					initial={{ opacity: 0, y: 20 }}
					key={`suggested-action-${suggestedAction.title}-${index}`}
					transition={{ delay: 0.05 * index }}
				>
					<Button
						className="h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col"
						onClick={async () => {
							sendMessage(suggestedAction.action)
						}}
						variant="ghost"
					>
						<span className="font-medium">{suggestedAction.title}</span>
						<span className="text-muted-foreground">{suggestedAction.label}</span>
					</Button>
				</motion.div>
			))}
		</div>
	)
}

export const SuggestedPrompts = memo(PureSuggestedPrompts, () => true)
