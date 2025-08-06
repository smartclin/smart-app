'use client'

import { motion } from 'framer-motion'

import { Skeleton } from '@/components/ui/skeleton'

import { SpinnerIcon } from './SpinnerIcon'

interface LoadingSkeletonProps {
	type: 'image' | 'web-search' | 'weather'
}

const LoadingSkeleton = ({ type }: LoadingSkeletonProps) => {
	if (type === 'weather') {
		return (
			<motion.div
				animate={{
					opacity: 1,
					transition: {
						duration: 0.2,
					},
				}}
				initial={{
					opacity: 0,
				}}
			>
				<div className="flex items-center gap-2 font-medium">
					<div className="animate-spin text-sm transition">
						<SpinnerIcon />
					</div>
					Getting the Weather
				</div>
			</motion.div>
		)
	}

	if (type === 'image') {
		return (
			<div className="max-w-sm space-y-3 max-md:max-w-full">
				<div className="flex items-center gap-2 text-sm">
					<div className="animate-spin transition">
						<SpinnerIcon />
					</div>
					Generating the Image
				</div>
				<Skeleton className="aspect-square max-w-sm rounded-lg" />
			</div>
		)
	}

	if (type === 'web-search') {
		return (
			<motion.div
				animate={{
					opacity: 1,
					transition: {
						duration: 0.2,
					},
				}}
				initial={{
					opacity: 0,
				}}
			>
				<div className="flex items-center gap-2 font-medium">
					<div className="animate-spin text-sm transition">
						<SpinnerIcon />
					</div>
					Searching the web
				</div>
			</motion.div>
		)
	}

	return null
}

export default LoadingSkeleton
