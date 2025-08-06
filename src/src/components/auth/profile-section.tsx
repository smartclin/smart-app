'use client'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { User } from 'better-auth'
import { Loader, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UploadButton } from '@/components/uploadthing'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'

const formSchema = z.object({
	name: z
		.string()
		.min(2, {
			message: 'Name is required',
		})
		.max(25, {
			message: 'Name must be less than 25 characters',
		}),
})

export const ProfileSection = ({ user, className }: { user: User; className?: string }) => {
	const [animate] = useAutoAnimate()
	const [isProfileBoxOpen, setIsProfileBoxOpen] = useState(false)
	const [image, setImage] = useState<string | null | undefined>(user.image)
	const [isLoading, setIsLoading] = useState(false)
	const [_error, setError] = useState('')
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: user.name,
		},
	})

	const onProfileSubmit = async (data: z.infer<typeof formSchema>) => {
		await authClient.updateUser(
			{
				name: data.name,
				image,
			},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: () => {
					setIsLoading(false)
					window.location.reload()
				},
				onError: ctx => {
					console.log(ctx.error.message)
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}
	const [animateRef] = useAutoAnimate()
	return (
		<div
			className={cn(
				'flex w-full flex-col items-start justify-between gap-8 py-3 md:flex-row md:gap-0',
				className,
			)}
		>
			<p className="pointer-events-none font-medium text-sm">Profile</p>
			<div
				className="w-full md:w-[65%]"
				ref={animate}
			>
				{!isProfileBoxOpen ? (
					<div className="flex items-center gap-4">
						<Avatar>
							{/* @ts-expect-error Just a simple type error */}
							<AvatarImage src={user?.image} />
							<AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
								<UserIcon className="size-4" />
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<p className="font-medium text-sm">{user.name}</p>
						</div>
						<Button
							className="ml-auto text-sm"
							onClick={() => setIsProfileBoxOpen(true)}
							size={'sm'}
							variant={'ghost'}
						>
							Update profile
						</Button>
					</div>
				) : (
					<Card className="shadow-md">
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<CardTitle className="text-sm tracking-tight">Update profile</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-6 flex items-center gap-3">
								{!image ? (
									<Avatar className="size-12">
										{/* @ts-expect-error Just a simple type error */}
										<AvatarImage src={user.image} />
										<AvatarFallback className="bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white">
											<UserIcon className="size-5" />
										</AvatarFallback>
									</Avatar>
								) : (
									<Avatar className="size-12">
										<AvatarImage src={image} />
									</Avatar>
								)}
								<div className="flex items-center space-x-2">
									<UploadButton
										className="ut-allowed-content:hidden ut-button:h-8 ut-button:w-20 ut-button:border ut-button:bg-transparent ut-button:text-black/60 ut-button:text-xs ut-label:text-red-500 ut-button:transition-all hover:ut-button:bg-black/5 hover:ut-button:text-black focus-visible:ut-button:ring-[4px] focus-visible:ut-button:ring-ring/20"
										disabled={true}
										endpoint="profilePic"
										onClientUploadComplete={res => {
											console.log('Files: ', res)
											setImage(res[0]?.ufsUrl)
										}}
										onUploadError={(error: Error) => {
											console.log(error.message)
										}}
									/>
									<Button
										className="text-destructive transition-all hover:bg-destructive/5 hover:text-destructive/80 focus-visible:border-2 focus-visible:border-destructive/15 focus-visible:ring-destructive/30"
										disabled={true}
										onClick={() => {
											setImage(null)
											router.refresh()
										}}
										size={'sm'}
										variant={'ghost'}
									>
										Remove
									</Button>
								</div>
							</div>

							<Form {...form}>
								<form onSubmit={form.handleSubmit(onProfileSubmit)}>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">Name</FormLabel>
												<FormControl>
													<Input
														{...field}
														autoComplete="off"
														autoCorrect="off"
														disabled={true}
														placeholder="John Doe"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										className="mt-4 mr-2"
										disabled={true}
										onClick={() => setIsProfileBoxOpen(false)}
										size={'sm'}
										type="button"
										variant={'ghost'}
									>
										Cancel
									</Button>
									<Button
										className="w-full bg-blue-500 shadow-inner hover:bg-blue-600 hover:ring-blue-600"
										disabled={isLoading}
										ref={animateRef}
										size="sm"
										type="submit"
									>
										{isLoading && (
											<Loader className="mr-3 ml-3 size-4 animate-spin text-center text-white" />
										)}
										Save
									</Button>
								</form>
							</Form>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
