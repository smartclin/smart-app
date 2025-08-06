'use client'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import axios from 'axios'
import type { Account } from 'better-auth'
import { Ellipsis, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { AuthUser } from '@/hooks/use-auth'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'

import { ErrorCard } from '../error-card'

export const ConnectionsSection = ({ user }: { user: AuthUser }) => {
	const [animate] = useAutoAnimate()
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [connections, setConnections] = useState<Account[]>([])
	const [isDeleteConnectionBoxOpen, setIsDeleteConnectionBoxOpen] = useState<
		'github' | 'google' | 'closed'
	>('closed')

	const passkeys = authClient.useListPasskeys()

	useEffect(() => {
		const getConnections = async () => {
			await authClient
				.listAccounts(
					{},
					{
						onRequest: () => {
							setIsLoading(true)
						},
						onSuccess: () => {
							setTimeout(() => {
								setIsLoading(false)
							}, 250)
						},
						onError: ctx => {
							alert(ctx.error.message)
							setIsLoading(false)
						},
					},
				)
				// @ts-expect-error Just a simple type error
				.then(res => setConnections(res.data))
		}
		getConnections()
	}, [])

	const onGithubDelete = async () => {
		setIsLoading(true)

		setTimeout(async () => {
			await axios
				.delete('/api/connections/delete/github')
				.catch(error => {
					setError(error.response.data.message)
					setIsLoading(false)
				})
				.finally(() => {
					setIsLoading(false)
					setIsDeleteConnectionBoxOpen('closed')
					window.location.reload()
				})
		}, 1000)
	}

	const onGoogleDelete = async () => {
		setIsLoading(true)

		setTimeout(async () => {
			await axios
				.delete('/api/connections/delete/google')
				.catch(error => {
					setError(error.response.data.message)
					setIsLoading(false)
				})
				.finally(() => {
					setIsLoading(false)
					setIsDeleteConnectionBoxOpen('closed')
					window.location.reload()
				})
		})
	}

	return (
		<div className="flex flex-col gap-10 md:w-[72%]">
			<div
				className="flex flex-col justify-between gap-8 md:flex-row md:gap-0"
				ref={animate}
			>
				<p className="font-medium text-sm">Connected Accounts</p>
				<div
					className="ml-4 flex flex-col gap-1 md:ml-0 md:w-[350px] md:items-end"
					ref={animate}
				>
					{error && (
						<ErrorCard
							className="-mt-2 w-full"
							error={error}
							size="sm"
						/>
					)}
					{isLoading ? (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-7 min-w-[350px] rounded-md" />
							<Skeleton className="h-7 min-w-[350px] rounded-md" />
							<Skeleton className="h-9 min-w-[125px] max-w-[125px] rounded-md" />
						</div>
					) : (
						<>
							{connections.map(connection => {
								// @ts-expect-error Just a simple type error
								const provider: string = connection.provider
								const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1)

								return (
									<div
										className="-mt-1 min-w-[350px]"
										key={connection.id}
										ref={animate}
									>
										<div className="flex items-center gap-4">
											<div
												className={cn(
													'-mt-2 flex items-center justify-between gap-4',
													provider === 'credential' && 'hidden',
												)}
												key={connection.id}
											>
												<div className={cn('flex items-center gap-2')}>
													{provider === 'google' && <FcGoogle size={18} />}
													{provider === 'github' && <FaGithub size={18} />}
													<p className="text-sm">{formattedProvider}</p>
													<p className="text-sm text-zinc-500">•</p>
													<p className="text-sm text-zinc-500/85">{user.email}</p>
												</div>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger
													asChild
													className={cn(
														'ml-auto inline-flex',
														provider === 'credential' && 'hidden',
													)}
												>
													<Button
														className="group"
														size="icon"
														variant={'ghost'}
													>
														<Ellipsis className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-800" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="center"
													className="min-w-fit px-0 py-0"
												>
													<DropdownMenuItem
														className="cursor-pointer px-3 py-1 text-zinc-600 transition-all focus:text-zinc-800"
														onClick={() => {
															setIsDeleteConnectionBoxOpen(
																provider === 'github' ? 'github' : 'google',
															)
														}}
													>
														<p className="text-destructive text-sm">Remove</p>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
										{isDeleteConnectionBoxOpen === 'github' && (
											<Card
												className={cn(
													'my-4 w-full border-zinc-600/15 bg-muted-foreground/5 shadow-md md:max-w-[350px]',
													isDeleteConnectionBoxOpen === 'github' &&
														provider !== 'github' &&
														'hidden',
												)}
											>
												<CardHeader className="flex w-full flex-col">
													<CardTitle className="text-sm tracking-tight">
														Remove Connection
													</CardTitle>
													<CardDescription className="text-xs">
														Are you sure you want to remove this connection?
														<br />
														This action cannot be undone.
													</CardDescription>
												</CardHeader>
												<CardContent>
													<Button
														className="mt-4 mr-2"
														disabled={isLoading}
														onClick={() => setIsDeleteConnectionBoxOpen('closed')}
														size={'sm'}
														variant={'ghost'}
													>
														Cancel
													</Button>
													<Button
														className="mt-4 mr-2"
														disabled={isLoading}
														onClick={() => onGithubDelete()}
														ref={animate}
														size={'sm'}
														variant={'destructive'}
													>
														{isLoading && <Loader className="size-2 animate-spin text-white" />}
														{!isLoading && 'Delete'}
													</Button>
												</CardContent>
											</Card>
										)}
										{isDeleteConnectionBoxOpen === 'google' && (
											<Card
												className={cn(
													'my-4 w-full border-zinc-600/15 bg-muted-foreground/5 shadow-md md:max-w-[350px]',
													isDeleteConnectionBoxOpen === 'google' &&
														provider !== 'google' &&
														'hidden',
												)}
											>
												<CardHeader className="flex w-full flex-col">
													<CardTitle className="text-sm tracking-tight">
														Remove Connection
													</CardTitle>
													<CardDescription className="text-xs">
														Are you sure you want to remove this connection?
														<br />
														This action cannot be undone.
													</CardDescription>
												</CardHeader>
												<CardContent>
													<Button
														className="mt-4 mr-2"
														disabled={isLoading}
														onClick={() => setIsDeleteConnectionBoxOpen('closed')}
														size={'sm'}
														variant={'ghost'}
													>
														Cancel
													</Button>
													<Button
														className="mt-4 mr-2"
														disabled={isLoading}
														onClick={onGoogleDelete}
														ref={animate}
														size={'sm'}
														variant={'destructive'}
													>
														{isLoading && <Loader className="size-2 animate-spin text-white" />}
														{!isLoading && 'Delete'}
													</Button>
												</CardContent>
											</Card>
										)}
									</div>
								)
							})}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										className={cn(
											'-mt-[7.5px] self-start text-sm',
											passkeys.data && passkeys.data.length > 0 ? '-ml-3' : 'md:ml-auto',
										)}
										size="sm"
										variant="ghost"
									>
										Add connection
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="min-w-[180px] rounded-lg py-[0.5px] shadow-lg"
								>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={async () => {
											await authClient.linkSocial(
												{
													provider: 'google',
													callbackURL: '/profile',
												},
												{
													onError: ctx => {
														setError(ctx.error.message)
													},
												},
											)
										}}
									>
										<FcGoogle size={18} />
										<p className="text-sm text-zinc-600">Google</p>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={async () => {
											await authClient.linkSocial(
												{
													provider: 'github',
													callbackURL: '/profile',
												},
												{
													onError: ctx => {
														setError(ctx.error.message)
													},
												},
											)
										}}
									>
										<FaGithub size={18} />
										<p className="text-sm text-zinc-600">Github</p>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
