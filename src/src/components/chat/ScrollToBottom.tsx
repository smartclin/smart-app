'use client'

import { ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ScrollToBottomButtonProps {
	onClick: () => void
	show: boolean
}

const ScrollToBottom = ({ onClick, show }: ScrollToBottomButtonProps) => {
	return (
		<div
			className={cn(
				'-translate-x-1/2 absolute bottom-5 left-1/2 z-20 transition-all duration-300 ease-in-out',
				show
					? 'pointer-events-auto translate-y-0 opacity-100'
					: 'pointer-events-none translate-y-4 opacity-0',
			)}
		>
			<Button
				className="rounded-full border bg-background/95 shadow-lg backdrop-blur-sm transition-all duration-200"
				onClick={onClick}
				size="icon"
				variant="secondary"
			>
				<ArrowDown className="size-4" />
				<span className="sr-only">Scroll to bottom</span>
			</Button>
		</div>
	)
}

export default ScrollToBottom
