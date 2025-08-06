'use client'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAutoSubmit } from '@/hooks/use-auto-submit'
import { authClient } from '@/lib/auth/auth-client'
import { AFTER_LOGIN } from '@/lib/routes'

import { CardWrapper } from './card-wrapper'
import { ErrorCard } from './error-card'
import { SplitOTP } from './split-otp'

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(8, {
		message: 'Password must be at least 8 characters long',
	}),
})

const verifySchema = z.object({
	otp: z.string().min(6, {
		message: 'Code must be 6 digits long',
	}),
})

const emailConfirmationSchema = z.object({
	email: z.email(),
})

export const LoginCard = ({ showSocial = true, ip }: { showSocial?: boolean; ip?: string }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [emailState, setEmailState] = useState('')
	const [isVerifyOtpBoxOpen, setIsVerifyOtpBoxOpen] = useState(false)
	const [isForgotPassword, setIsForgotPassword] = useState(false)
	const params = useSearchParams()
	const redirectParam = params.get('redirect')

	const router = useRouter()

	const toggleVisibility = () => setIsPasswordVisible(prevState => !prevState)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const verifyForm = useForm<z.infer<typeof verifySchema>>({
		resolver: zodResolver(verifySchema),
		defaultValues: {
			otp: '',
		},
	})

	const emailConfirmationForm = useForm<z.infer<typeof emailConfirmationSchema>>({
		resolver: zodResolver(emailConfirmationSchema),
		defaultValues: {
			email: '',
		},
	})

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		setEmailState(form.getValues().email)
		console.log(emailState)

		authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
			},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: async (ctx: { data: { twoFactorRedirect: boolean } }) => {
					if (ctx.data.twoFactorRedirect) {
						setError('')
						setIsVerifyOtpBoxOpen(true)
						setIsLoading(false)
					} else {
						setIsLoading(false)
						await axios.post('/api/send/email/recent-login', {
							email: data.email,
							userAgent: window.navigator.userAgent,
							ip,
						})
						if (redirectParam) {
							router.push(new URL(redirectParam).pathname)
						} else {
							router.push(AFTER_LOGIN)
						}
					}
				},
				onError: ctx => {
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

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
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

	const onVerifyOtpSubmit = async (data: z.infer<typeof verifySchema>) => {
		await authClient.twoFactor.verifyTotp(
			{
				code: data.otp,
			},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: async () => {
					setIsLoading(false)
					await axios.post('/api/send/email/recent-login', {
						email: emailState,
						userAgent: window.navigator.userAgent,
						ip,
					})
					if (redirectParam) {
						router.push(new URL(redirectParam).pathname)
					} else {
						router.push(AFTER_LOGIN)
					}
				},
				onError: ctx => {
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

	useAutoSubmit({
		trigger: verifyForm.trigger,
		watch: verifyForm.watch,
		onSubmit: verifyForm.handleSubmit(onVerifyOtpSubmit),
	})

	const onPasskeyLogin = async () => {
		await authClient.signIn.passkey(
			{},
			{
				onRequest: () => {
					setIsLoading(true)
				},
				onSuccess: async () => {
					setIsLoading(false)
					if (redirectParam) {
						router.push(new URL(redirectParam).pathname)
					} else {
						router.push(AFTER_LOGIN)
					}
				},
				onError: ctx => {
					setError(ctx.error.message)
					setIsLoading(false)
				},
			},
		)
	}

	const onResetPassword = async () => {
		setIsForgotPassword(true)
	}

	const [animateRef] = useAutoAnimate()

	return (
		<CardWrapper
			description="Welcome back! Please sign in to continue."
			footerRef={redirectParam ? 'registerWithRedirect' : 'register'}
			param={redirectParam ?? ''}
			ref={animateRef}
			title="Sign In to Acme co"
		>
			{!isVerifyOtpBoxOpen && !isForgotPassword ? (
				<>
					{showSocial && (
						<>
							<div
								className="flex items-center gap-2"
								ref={animateRef}
							>
								<Button
									className="w-full border-[1.5px] font-[450] text-zinc-500 shadow-sm hover:text-zinc-500"
									disabled={isLoading}
									onClick={onGithub}
									size={'sm'}
									type="button"
									variant={'outline'}
								>
									<FaGithub className="text-black text-lg" />
									Github
								</Button>
								<Button
									className="w-full border-[1.5px] font-[450] text-zinc-500 shadow-sm hover:text-zinc-500"
									disabled={isLoading}
									onClick={onGoogle}
									size={'sm'}
									type="button"
									variant={'outline'}
								>
									<FcGoogle className="text-lg" />
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
							className="flex flex-col space-y-8"
							onSubmit={form.handleSubmit(onSubmit)}
						>
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
											<div>
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
												<Button
													className="mt-2 text-blue-500 text-xs transition-all after:bg-blue-600 hover:text-blue-600 focus-visible:border-1 focus-visible:border-ring/20 focus-visible:ring-2 focus-visible:ring-ring/20"
													disabled={isLoading}
													onClick={onResetPassword}
													ref={animateRef}
													size={'sm'}
													type="button"
													variant={'link'}
												>
													Forgot password?
												</Button>
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
								{!isLoading && 'Sign In'}
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
							<Button
								className="mt-2 self-center text-blue-500 text-sm transition-all after:bg-blue-600 hover:text-blue-600 focus-visible:border-1 focus-visible:border-ring/20 focus-visible:ring-2 focus-visible:ring-ring/20"
								disabled={isLoading}
								onClick={onPasskeyLogin}
								ref={animateRef}
								size={'sm'}
								type="button"
								variant={'link'}
							>
								Use passkey instead
							</Button>
						</form>
					</Form>
				</>
			) : (
				<>
					{isVerifyOtpBoxOpen && !isForgotPassword && (
						<>
							<div ref={animateRef}>
								{error && (
									<ErrorCard
										error={error}
										size="sm"
									/>
								)}
							</div>
							<Form {...verifyForm}>
								<form className="flex flex-col items-center justify-center space-y-6">
									<FormField
										control={verifyForm.control}
										name="otp"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													{/* @ts-expect-error Just a simple type error */}
													<SplitOTP
														{...field}
														disabled={isLoading}
														maxLength={6}
													/>
												</FormControl>
												<FormDescription>Enter the code in your authenticator app.</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										className="w-full bg-blue-500 shadow-inner hover:bg-blue-600 hover:ring-blue-600"
										disabled={isLoading}
										onClick={() => {
											onVerifyOtpSubmit({ otp: verifyForm.getValues().otp })
										}}
										ref={animateRef}
										size="sm"
										type="button"
									>
										{isLoading && (
											<Loader className="mr-3 ml-3 size-4 animate-spin text-center text-white" />
										)}
										{!isLoading && 'Sign In'}
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
									<Button
										className="self-center text-blue-500 text-sm transition-all after:bg-blue-600 hover:text-blue-600 focus-visible:border-1 focus-visible:border-ring/20 focus-visible:ring-2 focus-visible:ring-ring/20"
										disabled={isLoading}
										onClick={() => {
											setIsVerifyOtpBoxOpen(false)
											verifyForm.reset()
											setError('')
										}}
										ref={animateRef}
										size={'sm'}
										type="button"
										variant={'link'}
									>
										Back to login
									</Button>
								</form>
							</Form>
						</>
					)}
					{isForgotPassword && !isVerifyOtpBoxOpen && (
						<>
							<div ref={animateRef}>
								{error && (
									<ErrorCard
										error={error}
										size="sm"
									/>
								)}
							</div>
							<Form {...emailConfirmationForm}>
								<form className="flex flex-col space-y-6">
									<FormField
										control={emailConfirmationForm.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormDescription>
													Enter your email address to reset your password.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										className="w-full bg-blue-500 shadow-inner hover:bg-blue-600 hover:ring-blue-600"
										disabled={isLoading}
										onClick={async () => {
											await authClient.forgetPassword(
												{
													email: emailConfirmationForm.getValues().email,
													redirectTo: '/reset-password',
												},
												{
													onError: ctx => {
														setError(ctx.error.message)
														setIsLoading(false)
													},
													onSuccess: () => {
														setIsLoading(false)
														toast.success('Password reset link sent. Please check your email.')
													},
												},
											)
										}}
										ref={animateRef}
										size="sm"
										type="button"
									>
										{isLoading && (
											<Loader className="mr-3 ml-3 size-4 animate-spin text-center text-white" />
										)}
										{!isLoading && 'Send reset link'}
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
									<Button
										className="self-center text-blue-500 text-sm transition-all after:bg-blue-600 hover:text-blue-600 focus-visible:border-1 focus-visible:border-ring/20 focus-visible:ring-2 focus-visible:ring-ring/20"
										disabled={isLoading}
										onClick={() => {
											setIsForgotPassword(false)
											emailConfirmationForm.reset()
											setError('')
										}}
										ref={animateRef}
										size={'sm'}
										type="button"
										variant={'link'}
									>
										Back to login
									</Button>
								</form>
							</Form>
						</>
					)}
				</>
			)}
		</CardWrapper>
	)
}
