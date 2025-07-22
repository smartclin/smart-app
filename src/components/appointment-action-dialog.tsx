'use client'

import { Ban, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GiConfirmed } from 'react-icons/gi'
import { MdCancel } from 'react-icons/md'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/react' // Import tRPC client for client components

import { Button } from './ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'

interface ActionsProps {
	type: 'approve' | 'cancel'
	id: number // Assuming ID is a string (UUID) based on common Prisma patterns
	disabled: boolean // This prop likely means 'is the button disabled by external logic?'
}

export const AppointmentActionDialog = ({ type, id, disabled }: ActionsProps) => {
	// `isSubmitting` will come from the tRPC mutation hook
	const [reason, setReason] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false) // State to control dialog open/close
	const router = useRouter()

	// 1. Declare the tRPC mutation hook at the top level of the component
	// Assuming your tRPC procedure is `trpc.appointment.updateAppointmentStatus`
	const { mutateAsync: updateStatusMutation, isPending: isSubmitting } =
		trpc.appointment.updateAppointmentStatus.useMutation({
			onSuccess: res => {
				// Assuming your tRPC mutation returns an object with `success` and `msg`
				if (res.success) {
					toast.success(res.msg || 'Appointment status updated successfully!')
					setReason('') // Clear reason on success
					setIsDialogOpen(false) // Close the dialog on success
					router.refresh() // Refresh page data
				} else {
					// If your backend returns `success: false` but no specific error field, check `msg`
					toast.error(res.msg || 'Failed to update appointment status.')
				}
			},
			onError: error => {
				console.error('Error updating appointment status:', error)
				toast.error(error.message || 'Something went wrong. Please try again.')
			},
		})

	const handleAction = async () => {
		if (type === 'cancel' && !reason.trim()) {
			// Use .trim() to check for empty string
			toast.error('Please provide a reason for cancellation.')
			return
		}

		try {
			// Determine the new status based on the action type
			const newStatus = type === 'approve' ? 'SCHEDULED' : 'CANCELLED'

			// Construct the reason message
			const finalReason =
				reason.trim() || // Use provided reason if available
				`Appointment has been ${newStatus.toLowerCase()} on ${new Date().toLocaleString()}` // Fallback message

			// 2. Call the `mutateAsync` function with the payload
			// The payload must match the input schema of your `updateAppointmentStatus` tRPC procedure.
			// Example payload: { id: string, status: 'SCHEDULED' | 'CANCELLED', reason: string }
			await updateStatusMutation({
				id: id, // Pass the appointment ID
				status: newStatus, // Pass the new status
				reason: finalReason, // Pass the reason
			})
		} catch (error) {
			// Errors from tRPC mutations are generally caught by the `onError` callback.
			// This outer catch block would only catch errors that occur *before* the mutation
			// is even sent (e.g., network issues, or if `mutateAsync` itself throws synchronously).
			console.error('Unexpected error during appointment action:', error)
			toast.error('An unexpected error occurred. Please try again.')
		}
	}

	return (
		<Dialog
			onOpenChange={setIsDialogOpen}
			open={isDialogOpen}
		>
			<DialogTrigger
				asChild
				// `disabled` prop on DialogTrigger controls whether the dialog can be opened.
				// If you want the button to be disabled based on the `disabled` prop passed to ActionsProps,
				// then pass `disabled={disabled}` to the Button component inside the trigger.
				// The current `!disabled` seems counter-intuitive; typically you disable if `disabled` is true.
				// Assuming `disabled` from props means "is the button itself disabled?"
			>
				{type === 'approve' ? (
					<Button
						className="w-full justify-start"
						disabled={disabled || isSubmitting}
						size="sm"
						variant="ghost" // Disable if prop.disabled is true OR if submitting
					>
						<Check size={16} /> Approve
					</Button>
				) : (
					<Button
						className="flex w-full items-center justify-start gap-2 rounded-full text-red-500 disabled:cursor-not-allowed"
						disabled={disabled || isSubmitting}
						size="sm"
						variant="outline" // Disable if prop.disabled is true OR if submitting
					>
						<Ban size={16} /> Cancel
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="max-w-[450px]">
				{' '}
				{/* Added max-width for better styling */}
				<div className="flex flex-col items-center justify-center py-6 text-center">
					<DialogTitle>
						{type === 'approve' ? (
							<div className="mb-2 rounded-full bg-emerald-200 p-4">
								<GiConfirmed
									className="text-emerald-500"
									size={50}
								/>
							</div>
						) : (
							<div className="mb-2 rounded-full bg-red-200 p-4">
								<MdCancel
									className="text-red-500"
									size={50}
								/>
							</div>
						)}
					</DialogTitle>

					<span className="font-semibold text-black text-xl">
						Appointment {type === 'approve' ? 'Confirmation' : 'Cancellation'}
					</span>
					<p className="mt-2 text-gray-500 text-sm">
						{type === 'approve'
							? "You're about to confirm this appointment. Click 'Confirm' to approve or 'Close' to keep it pending."
							: 'Are you sure you want to cancel this appointment? Please provide a reason.'}
					</p>

					{type === 'cancel' && (
						<Textarea
							className="mt-4"
							disabled={isSubmitting} // Disable textarea while submitting
							onChange={e => setReason(e.target.value)}
							placeholder="Cancellation reason (required)..."
							value={reason} // Controlled component
						/>
					)}

					<div className="mt-6 flex items-center justify-center gap-x-4">
						<Button
							className={cn(
								'px-4 py-2 font-medium text-sm text-white hover:text-white',
								type === 'approve'
									? 'bg-blue-600 hover:bg-blue-700'
									: 'bg-destructive hover:bg-destructive-dark', // Use a specific hover color
							)}
							disabled={isSubmitting || (type === 'cancel' && !reason.trim())} // Disable if submitting OR if cancel and reason is empty
							onClick={handleAction}
							// variant="outline" // Removed variant="outline" as it conflicts with background color
						>
							{isSubmitting ? 'Processing...' : type === 'approve' ? 'Confirm' : 'Yes, Cancel'}
						</Button>
						<DialogClose asChild>
							<Button
								className="px-4 py-2 text-gray-500 text-sm underline"
								disabled={isSubmitting}
								variant="outline" // Disable close button while submitting
							>
								Close
							</Button>
						</DialogClose>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
