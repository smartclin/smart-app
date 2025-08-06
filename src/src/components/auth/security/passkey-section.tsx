'use client'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ellipsis, Loader } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'

const renamePasskeySchema = z.object({
	name: z
		.string()
		.min(2, {
			message: 'Name is required',
		})
		.max(25, {
			message: 'Name must be less than 25 characters',
		}),
})

export const PasskeySection = () => {
	const [animate] = useAutoAnimate()
	const [isRenamePasskeyBoxOpen, setIsRenamePasskeyBoxOpen] = useState<string | boolean>(false)
	const [isDeletePasskeyBoxOpen, setIsDeletePasskeyBoxOpen] = useState<string | boolean>(false)
	const [_error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const passkeys = authClient.useListPasskeys()

	// if (passkeys.isPending) {
	//   setIsLoading(true);
	// } else {
	//   setIsLoading(false);
	// }

	const renamePasskeyForm = useForm<z.infer<typeof renamePasskeySchema>>({
		resolver: zodResolver(renamePasskeySchema),
		defaultValues: {
			name: '',
		},
	})

	const parsedAgent = UAParser(window.navigator.userAgent?.toString())

	const onRenamePasskeySubmit = async (data: z.infer<typeof renamePasskeySchema>, id: string) => {
		if (data.name.length < 2) {
			setError('Name is required')
		}

		await authClient.passkey.updatePasskey(
			{
				id,
				name: data.name,
			},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: () => {
					setIsLoading(false)
					setIsRenamePasskeyBoxOpen(false)
					window.location.reload()
					setTimeout(() => {
						toast.success('Successfully renamed')
					}, 1000)
				},
				onError: ctx => {
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

	const onAddPasskey = async () => {
		await authClient.passkey.addPasskey({
			name: `${parsedAgent.os.name}, ${parsedAgent.browser.name}`,
		})
	}

	return (
		<div className="flex flex-col gap-10 md:w-[72%]">
			<div
				className="flex flex-col justify-between gap-8 md:flex-row md:gap-0"
				ref={animate}
			>
				<p className="font-medium text-sm">Passkeys</p>

				<div
					className="ml-4 flex flex-col items-end gap-6 md:ml-0 md:w-[350px]"
					ref={animate}
				>
					{isLoading ? (
						<div>Loading</div>
					) : (
						<div className="flex flex-col gap-4">
							{passkeys.data?.map(passkey => {
								const now = new Date()
								const createdAt = new Date(passkey.createdAt)
								const diffInMs = now.getTime() - createdAt.getTime()
								const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
								const hours = createdAt.getHours()
								const minutes = createdAt.getMinutes()
								const amPm = hours >= 12 ? 'PM' : 'AM'
								const formattedHours = hours % 12 || 12
								const formattedMinutes = minutes.toString().padStart(2, '0')

								const formattedDate =
									diffInDays < 1
										? `Today at ${formattedHours}:${formattedMinutes}${amPm}`
										: diffInDays < 2
											? `Yesterday at ${formattedHours}:${formattedMinutes}${amPm}`
											: `${createdAt.getDate()} ${createdAt.toLocaleString('default', { month: 'short' })} at ${formattedHours}:${formattedMinutes}${amPm}`

								return (
									<Fragment key={passkey.id}>
										<div className="flex w-full items-center justify-between gap-4 self-start">
											<div className="flex flex-col gap-2">
												<p className="font-medium text-sm">{passkey.name}</p>
												<p className="text-xs text-zinc-500">Created: {formattedDate}</p>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														className="group -mt-2 self-start"
														size="icon"
														variant="ghost"
													>
														<Ellipsis className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-800" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="center"
													className="min-w-fit rounded-lg p-0 shadow-lg"
												>
													<DropdownMenuItem
														className="cursor-pointer px-3 py-1 text-zinc-600 transition-all focus:text-zinc-800"
														onClick={() => setIsRenamePasskeyBoxOpen(passkey.id)}
													>
														<p className="text-sm">Rename</p>
													</DropdownMenuItem>
													<DropdownMenuItem
														className="cursor-pointer px-3 py-1 text-destructive/80 focus:bg-destructive/5 focus:text-red-500"
														onClick={() => setIsDeletePasskeyBoxOpen(passkey.id)}
													>
														<p className="text-sm">Remove</p>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{/* Rename Card */}
										{isRenamePasskeyBoxOpen === passkey.id && (
											<Card className="w-full shadow-md md:max-w-[350px]">
												<CardHeader className="flex w-full flex-col">
													<CardTitle className="text-sm tracking-tight">Rename Passkey</CardTitle>
													<CardDescription className="text-xs">
														You can change the passkey name to make it easier to find.
													</CardDescription>
												</CardHeader>
												<CardContent>
													<Form {...renamePasskeyForm}>
														<form className="flex flex-col space-y-6">
															<FormField
																control={renamePasskeyForm.control}
																name="name"
																render={({ field }) => (
																	<FormItem>
																		<FormControl>
																			<Input
																				{...field}
																				autoComplete="off"
																				autoCorrect="off"
																				disabled={isLoading}
																				placeholder="Name"
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
															<div className="flex items-center">
																<Button
																	className="mt-4 mr-2 text-xs"
																	disabled={isLoading}
																	onClick={() => {
																		setIsRenamePasskeyBoxOpen(false)
																		setError('')
																	}}
																	size="sm"
																	type="button"
																	variant="ghost"
																>
																	Cancel
																</Button>
																<Button
																	className="mt-4"
																	disabled={isLoading}
																	onClick={() => {
																		onRenamePasskeySubmit(renamePasskeyForm.getValues(), passkey.id)
																	}}
																	size="sm"
																	type="button"
																>
																	{isLoading && (
																		<Loader className="mr-1 size-2 animate-spin text-muted-foreground" />
																	)}
																	Save
																</Button>
															</div>
														</form>
													</Form>
												</CardContent>
											</Card>
										)}

										{/* Delete Card */}
										{isDeletePasskeyBoxOpen === passkey.id && (
											<Card className="w-full border-zinc-600/15 bg-muted-foreground/5 shadow-md md:max-w-[350px]">
												<CardHeader className="flex w-full flex-col">
													<CardTitle className="text-sm tracking-tight">Delete Passkey</CardTitle>
													<CardDescription className="text-xs">
														Are you sure you want to delete this passkey?
														<br />
														This action cannot be undone.
													</CardDescription>
												</CardHeader>
												<CardContent>
													<Button
														className="mt-4 mr-2"
														disabled={isLoading}
														onClick={() => setIsDeletePasskeyBoxOpen(false)}
														size="sm"
														variant="ghost"
													>
														Cancel
													</Button>
													<Button
														className="mt-4 mr-2 shadow-inner"
														disabled={isLoading}
														onClick={() => {
															authClient.passkey.deletePasskey(
																{ id: passkey.id },
																{
																	onRequest: () => setIsLoading(true),
																	onSuccess: () => {
																		setIsLoading(false)
																		setIsDeletePasskeyBoxOpen(false)
																		window.location.reload()
																		setTimeout(() => toast.success('Successfully deleted'), 1000)
																	},
																	onError: ctx => {
																		setError(ctx.error.message)
																		setIsLoading(false)
																	},
																},
															)
														}}
														ref={animate}
														size="sm"
														variant="destructive"
													>
														{isLoading ? (
															<Loader className="size-2 animate-spin text-white" />
														) : (
															'Delete'
														)}
													</Button>
												</CardContent>
											</Card>
										)}
									</Fragment>
								)
							})}
						</div>
					)}
					<Button
						className={cn(
							'-mt-[4px] self-start text-sm',
							(passkeys.data?.length ?? 0) ? '-ml-3' : 'md:ml-auto',
						)}
						onClick={onAddPasskey}
						size="sm"
						variant="ghost"
					>
						Add passkey
					</Button>
				</div>
			</div>
		</div>
	)
}
