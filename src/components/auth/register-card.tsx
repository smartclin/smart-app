'use client'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/auth-client'
import { AFTER_LOGIN } from '@/lib/routes'

import { CardWrapper } from './card-wrapper'
import { ErrorCard } from './error-card'
export const RegisterCard = ({ showSocial = true }: { showSocial?: boolean }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const params = useSearchParams()
	const redirectParam = params.get('redirect')
	const router = useRouter()
	const toggleVisibility = () => setIsPasswordVisible(prev => !prev)
	const [animateRef] = useAutoAnimate()

	const formSchema = z.object({
		name: z.string().min(4),
		email: z.email(),
		password: z.string().min(8),
	})
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			name: '',
		},
	})

	type FormSchemaType = z.infer<typeof formSchema>

	const onSubmit: SubmitHandler<FormSchemaType> = async data => {
		authClient.signUp.email(
			{
				name: data.name,
				email: data.email,
				password: data.password,
			},
			{
				onRequest: () => setIsLoading(true),
				onSuccess: () => {
					setIsLoading(false)
					router.push(redirectParam ? new URL(redirectParam).pathname : AFTER_LOGIN)
				},
				onError: ctx => {
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

	// JSX rendering here...

	const onGithub = async () => {
		authClient.signIn.social(
			{
				provider: 'github',
				callbackURL: redirectParam ? new URL(redirectParam).pathname : '/profile',
			},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: () => {
					setIsLoading(false)
				},
				onError: ctx => {
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

	const onGoogle = async () => {
		authClient.signIn.social(
			{
				provider: 'google',
				callbackURL: redirectParam ? new URL(redirectParam).pathname : '/profile',
			},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: () => {
					setIsLoading(false)
				},
				onError: ctx => {
					setIsLoading(false)
					setError(ctx.error.message)
				},
			},
		)
	}

	return (
		<CardWrapper
			description="Welcome! Please sign up to continue."
			footerRef={redirectParam ? 'loginWithRedirect' : 'login'}
			param={redirectParam ?? ''}
			ref={animateRef}
			title="Sign up to Acme co"
		>
			{showSocial && (
				<>
					<div className="flex items-center gap-2">
						<Button
							className="w-full border-[1.5px] font-[450] text-zinc-500 shadow-sm hover:text-zinc-500"
							disabled={isLoading}
							onClick={onGithub}
							size="sm"
							type="button"
							variant={'outline'}
						>
							<span>
								<FaGithub className="text-black text-lg" />
							</span>
							Github
						</Button>
						<Button
							className="w-full border-[1.5px] font-[450] text-zinc-500 shadow-sm hover:text-zinc-500"
							disabled={isLoading}
							onClick={onGoogle}
							size="sm"
							type="button"
							variant={'outline'}
						>
							<span>
								<FcGoogle />
							</span>
							Google
						</Button>
					</div>
					<div className="relative my-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">or</span>
					</div>
				</>
			)}
			<div ref={animateRef}>{error && <ErrorCard error={error} />}</div>
			<Form {...form}>
				<form
					autoComplete="off"
					className="space-y-8"
					onSubmit={form.handleSubmit(onSubmit)}
					ref={animateRef}
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										type="email"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											{...field}
											autoComplete="off"
											autoCorrect="off"
											className="pe-9"
											disabled={isLoading}
											type={isPasswordVisible ? 'text' : 'password'}
										/>
										<button
											aria-controls="password"
											aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
											aria-pressed={isPasswordVisible}
											className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
											onClick={toggleVisibility}
											type="button"
										>
											{isPasswordVisible ? (
												<EyeOff
													aria-hidden="true"
													size={16}
													strokeWidth={2}
												/>
											) : (
												<Eye
													aria-hidden="true"
													size={16}
													strokeWidth={2}
												/>
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
						{!isLoading && 'Sign Up'}
						{!isLoading && (
							<svg className="-ml-1 mt-2 text-white/50">
								<title> Path </title>
								<path
									d="m7.25 5-3.5-2.25v4.5L7.25 5Z"
									fill="currentColor"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
								/>
							</svg>
						)}
					</Button>
				</form>
			</Form>
		</CardWrapper>
	)
}
