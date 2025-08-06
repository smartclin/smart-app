'use client'

import { ChevronUpIcon } from 'lucide-react'
import Image from 'next/image'
import { startTransition, useOptimistic } from 'react'

import { saveChatModelAsCookie } from '@/lib/model'
import { MODEL_REGISTRY, type ModelId } from '@/lib/model/model'
import type { Tool } from '@/lib/tools/tool'

import { Button } from '../ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface ModelDropDownProps {
	initialModel: ModelId
	currentTool: Tool
	disabled?: boolean
}

const ModelDropDown = ({ initialModel, disabled = false, currentTool }: ModelDropDownProps) => {
	const [optimisticModel, setOptimisticModel] = useOptimistic(
		initialModel || 'gemini-2.5-flash-lite-preview-06-17',
	)

	const handleModelChange = (modelId: ModelId) => {
		if (disabled) return

		startTransition(async () => {
			setOptimisticModel(modelId)
			await saveChatModelAsCookie(modelId)
		})
	}

	const currentModel = MODEL_REGISTRY[optimisticModel]

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				className="text-sm"
			>
				<Button
					className={`rounded-lg max-md:text-xs ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
					disabled={disabled}
					size="sm"
					variant="ghost"
				>
					{currentModel.name}
					<ChevronUpIcon className="ml-1 h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg px-2 pt-2.5"
				side="top"
				sideOffset={4}
			>
				{Object.entries(MODEL_REGISTRY).map(([modelId, config]) => (
					<DropdownMenuItem
						className={`mb-2 cursor-pointer max-md:text-xs ${
							modelId === optimisticModel ? 'bg-muted font-semibold' : ''
						} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
						disabled={disabled || (modelId === 'qwen/qwen3-32b' && currentTool !== 'reasoning')}
						key={modelId}
						onClick={() => !disabled && handleModelChange(modelId as ModelId)}
					>
						<div className="flex items-center gap-1.5">
							<Image
								alt={`${config.name}`}
								className="size-4"
								height={20}
								src={config.logo}
								width={20}
							/>
							<span className="max-sm:text-xs">{config.name}</span>
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default ModelDropDown
