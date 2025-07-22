'use client'

import { zodResolver } from '@hookform/resolvers/zod' // Make sure this is installed: npm install @hookform/resolvers
import type { TRPCClientErrorLike } from '@trpc/client'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form' // Import useForm
import { toast } from 'sonner'
import type { z } from 'zod'

import { StaffSchema as StaffFormSchema } from '@/lib/schema' // Alias to avoid name conflict with local type
import { trpc } from '@/trpc/react'
import type { AppRouter } from '@/trpc/routers/_app'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

const TYPES = [{ label: 'Nurse', value: 'NURSE' }]

// Define default values for the form
const defaultValues: z.infer<typeof StaffFormSchema> = {
	name: '',
	email: '',
	phone: '',
	licenseNumber: '',
	department: '',
	img: '',
	address: '',
	password: '',
	role: 'STAFF', // Default role if not provided by the user
}

export const StaffForm = () => {
	const router = useRouter()

	// Initialize react-hook-form
	const form = useForm<z.infer<typeof StaffFormSchema>>({
		resolver: zodResolver(StaffFormSchema),
		defaultValues: defaultValues,
		mode: 'onBlur', // Or 'onChange' or 'onSubmit'
	})

	type CreateNewStaffError = TRPCClientErrorLike<AppRouter>

	const { mutateAsync: createStaffMutation, isPending: isSubmitting } =
		trpc.admin.createNewStaff.useMutation({
			onSuccess: res => {
				// Now 'res' will have the correct type, and type guards can be used
				if (res.success) {
					// This check should now be type-safe
					toast.success('Staff added successfully!')
					form.reset() // Reset the form after successful submission
					router.refresh() // Refresh the page to show new staff
				} else {
					toast.error(res.message || res.msg || 'Failed to add staff.')
				}
			},
			onError: (error: CreateNewStaffError) => {
				console.error('Error adding staff:', error)
				toast.error(error.message || 'Something went wrong. Try again later.')
			},
		})

	const handleSubmit = async (values: z.infer<typeof StaffFormSchema>) => {
		try {
			await createStaffMutation(values) // Pass the form values to the mutation
		} catch (error) {
			// Errors from tRPC mutations are generally caught by the onError callback,
			// but this outer catch can handle unexpected errors during the call itself.
			console.error('Unexpected error during staff submission:', error)
			toast.error('An unexpected error occurred during submission. Please try again.')
		}
	}

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<Plus size={20} />
					New Staff
				</Button>
			</SheetTrigger>

			<SheetContent className="w-full overflow-y-scroll rounded-xl rounded-r-xl md:top-[5%] md:right-[1%] md:h-[90%]">
				<SheetHeader>
					<SheetTitle>Add New Staff</SheetTitle>
				</SheetHeader>

				<div>
					<Form {...form}>
						{' '}
						{/* Pass the `form` object to the Form context */}
						<form
							className="mt-5 space-y-8 2xl:mt-10"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<CustomInput
								control={form.control}
								label="Type"
								name="role"
								placeholder=""
								selectList={TYPES}
								type="radio"
							/>

							<CustomInput
								control={form.control}
								label="Full Name"
								name="name"
								placeholder="Staff name"
								type="input"
							/>

							<div className="flex items-center gap-2">
								<CustomInput
									control={form.control}
									label="Email Address"
									name="email"
									placeholder="john@example.com"
									type="input"
								/>

								<CustomInput
									control={form.control}
									label="Contact Number"
									name="phone"
									placeholder="9225600735"
									type="input"
								/>
							</div>

							<CustomInput
								control={form.control}
								label="License Number"
								name="licenseNumber"
								placeholder="License Number"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Department"
								name="department"
								placeholder="Children's ward"
								type="input"
							/>

							<CustomInput
								control={form.control}
								label="Address"
								name="address"
								placeholder="1479 Street, Apt 1839-G, NY"
								type="input"
							/>

							<CustomInput
								control={form.control}
								inputType="password"
								label="Password"
								name="password"
								placeholder=""
								type="input"
							/>

							<Button
								className="w-full"
								disabled={isSubmitting}
								type="submit"
							>
								{isSubmitting ? 'Submitting...' : 'Submit'}
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	)
}
