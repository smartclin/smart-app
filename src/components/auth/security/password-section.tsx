'use client'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ErrorCard } from '@/components/auth/error-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { authClient } from '@/lib/auth/auth-client'

// Define the Zod schema once, outside the component to prevent re-declaration
const newPasswordSchema = z.object({
	oldPassword: z.string().min(1, 'Old password is required'),
	newPassword: z.string().min(8, 'New password must be at least 8 characters'),
	revokeOtherSessions: z.boolean().default(false), // Ensure default is set for consistent type inference
})

// Infer the type from the Zod schema for strong typing
type NewPasswordFormValues = z.infer<typeof newPasswordSchema>

export const PasswordSection = () => {
	// State for auto-animate, password box visibility, error messages,
	// password input visibility, and loading state
	const [animate] = useAutoAnimate()
	const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false)
	const [error, setError] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// Toggle functions for password input visibility
	const toggleVisibility = () => setIsPasswordVisible(prevState => !prevState)
	const toggleNewVisibility = () => setIsNewPasswordVisible(prevState => !prevState)

	// Initialize React Hook Form with Zod resolver and default values
	const form = useForm<NewPasswordFormValues>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			revokeOtherSessions: false,
		},
	})

	// Destructure control, handleSubmit, and reset from the form object
	const { control, handleSubmit, reset } = form

	// Function to handle password submission
	const onPasswordSubmit = async (data: NewPasswordFormValues) => {
		setIsLoading(true) // Set loading state to true
		setError('') // Clear any previous errors

		try {
			// Call the authClient to change password
			await authClient.changePassword(
				{
					newPassword: data.newPassword,
					currentPassword: data.oldPassword,
					revokeOtherSessions: data.revokeOtherSessions,
				},
				// The original code had onRequest, onSuccess, onError callbacks here
				// For direct usage, handling loading/error states within the try-catch-finally block is common.
				// If authClient has specific callback options, they should be passed as per its API.
			)
			setIsPasswordBoxOpen(false) // Close the password box on successful submission
			reset() // Reset the form fields to their default values
		} catch (err) {
			// Log and set error message if an error occurs
			console.error(err.message)
			setError(err.message || 'An unexpected error occurred.')
		} finally {
			setIsLoading(false) // Always set loading state to false
		}
	}

	return (
		<div className="flex flex-col gap-10 md:w-[72%]">
			<div ref={animate}>
				{!isPasswordBoxOpen ? (
					// Display compact password view when box is closed
					<div className="flex items-center justify-between">
						<p className="font-medium text-sm">Password</p>
						<p className="font-medium text-sm">••••••••••</p>
						<Button
							className="text-sm"
							onClick={() => setIsPasswordBoxOpen(true)}
							size={'sm'}
							variant={'ghost'}
						>
							Update password
						</Button>
					</div>
				) : (
					// Display password update form when box is open
					<Card className="shadow-md">
						<CardHeader className="flex w-full flex-row items-center justify-between">
							<CardTitle className="text-sm tracking-tight">Update password</CardTitle>
						</CardHeader>
						<CardContent>
							{/* Display error card if there's an error */}
							{error && (
								<ErrorCard
									error={error}
									size="sm"
								/>
							)}
							{/* Form context provider for React Hook Form */}
							<Form {...form}>
								<form
									className="space-y-6"
									onSubmit={handleSubmit(onPasswordSubmit)}
								>
									{/* Form field for old password */}
									<FormField
										control={control}
										name="oldPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">Current Password</FormLabel>
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
									{/* Form field for new password */}
									<FormField
										control={control}
										name="newPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">New Password</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															{...field}
															autoComplete="off"
															autoCorrect="off"
															className="pe-9"
															disabled={isLoading}
															type={isNewPasswordVisible ? 'text' : 'password'}
														/>
														<button
															aria-controls="password"
															aria-label={isNewPasswordVisible ? 'Hide password' : 'Show password'}
															aria-pressed={isNewPasswordVisible}
															className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
															onClick={toggleNewVisibility}
															type="button"
														>
															{isNewPasswordVisible ? (
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
									{/* Form field for revoke other sessions checkbox */}
									<FormField
										control={control}
										name="revokeOtherSessions"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Sign out of all other devices</FormLabel>
													<FormDescription className="text-zinc-500">
														It is recommended to sign out of all other devices which may have used
														your old password.
													</FormDescription>
												</div>
												<FormMessage /> {/* Display error message for checkbox */}
											</FormItem>
										)}
									/>
									{/* Action buttons */}
									<Button
										className="mt-4 mr-2"
										disabled={isLoading}
										onClick={() => {
											setIsPasswordBoxOpen(false)
											reset() // Use reset from useForm to clear form fields
											setError('')
											setIsPasswordVisible(false)
											setIsNewPasswordVisible(false)
										}}
										size={'sm'}
										type="button"
										variant={'ghost'}
									>
										Cancel
									</Button>
									<Button
										className="mt-4"
										disabled={isLoading}
										size={'sm'}
										type="submit"
									>
										{isLoading && (
											<Loader className="mr-1 size-2 animate-spin text-muted-foreground" />
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
