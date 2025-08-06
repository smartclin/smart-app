'use client'

import { Download, Expand } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ImageDisplayProps {
	imageUrl: string
	prompt: string
}

const ImageDisplay = ({ imageUrl, prompt }: ImageDisplayProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const handleDownload = async () => {
		try {
			const response = await fetch(imageUrl)
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `generated-image-${Date.now()}.png`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (error) {
			console.error('Failed to download image:', error)
		}
	}

	return (
		<div className="max-w-sm space-y-3 max-md:max-w-full">
			{/* ✅ Replaced interactive div with semantic button */}
			<button
				className="group relative w-full cursor-pointer border-none bg-transparent p-0"
				onClick={() => setIsOpen(true)}
				type="button"
			>
				<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs dark:shadow-none">
					<Image
						alt={prompt}
						className="object-cover transition-transform"
						fill
						priority
						quality={100}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						src={imageUrl}
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20 max-sm:hidden">
						<Expand className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
					</div>
				</div>
			</button>

			<div className="flex items-center justify-between">
				<p className="line-clamp-1 max-w-xs text-muted-foreground text-sm">
					{prompt.at(0)?.toUpperCase() + prompt.slice(1)}
				</p>
				<Button
					onClick={handleDownload}
					size="icon"
					variant="ghost"
				>
					<Download />
				</Button>
			</div>

			<Dialog
				onOpenChange={setIsOpen}
				open={isOpen}
			>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Generated Image</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
							<Image
								alt={prompt}
								className="object-contain"
								fill
								priority
								quality={100}
								sizes="(max-width: 768px) 100vw, 80vw"
								src={imageUrl}
							/>
						</div>
						<div className="flex items-center justify-between">
							<p className="line-clamp-1 max-w-xs text-muted-foreground text-sm">
								{prompt.at(0)?.toUpperCase() + prompt.slice(1)}
							</p>
							<Button onClick={handleDownload}>
								<Download className="h-4 w-4" />
								Download
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default ImageDisplay
