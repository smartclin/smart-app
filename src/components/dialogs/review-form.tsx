'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, StarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// import { createReview } from '@/app/actions/general' // REMOVE this import
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client' // Import the tRPC client

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Textarea } from '../ui/textarea'

// Define the Zod schema for the review form values.
// This should match the input schema of your server-side tRPC procedure.
export const reviewSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'), // Ensure patientId is present
  staffId: z.string().min(1, 'Staff ID is required'), // Ensure staffId is present
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters long')
    .max(500, 'Review must not exceed 500 characters'),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>

export const ReviewForm = ({ staffId }: { staffId: string }) => {
  const router = useRouter()
  const { user } = useAuth()
  const userId = user?.id // This will be the patientId
  const [isDialogOpen, setIsDialogOpen] = useState(false) // State to control dialog open/close

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      patientId: '', // Will be set by useEffect
      staffId: staffId,
      rating: 1,
      comment: '',
    },
  })

  // Define the tRPC mutation for creating a review
  const { mutateAsync: createReviewMutation, isPending: isSubmitting } =
    trpc.staff.createReview.useMutation({
      // Ass your tRPC procedure is `trpc.review.createReview`
      onSuccess: (res) => {
        // Assuming your tRPC mutation returns an object with `success` and `message`
        if (res.success) {
          toast.success(res.message || 'Review submitted successfully!')
          form.reset() // Reset form fields
          setIsDialogOpen(false) // Close the dialog on success
          router.refresh() // Refresh the page to show the new review
        } else {
          toast.error(res.message || 'Failed to submit review.')
        }
      },
      onError: (error) => {
        console.error('Error submitting review:', error)
        toast.error(error.message || 'Something went wrong. Please try again.')
      },
    })

  // Set patientId after userId is available
  useEffect(() => {
    if (userId) {
      form.setValue('patientId', userId)
    }
  }, [userId, form])

  const handleSubmit = async (values: ReviewFormValues) => {
    // Ensure patientId is set before submitting
    if (!userId) {
      toast.error('User not authenticated. Cannot submit review.')
      return
    }
    // Ensure the patientId in form values is the current user's ID
    // This prevents potential mismatch if defaultValues was used before userId was available
    values.patientId = userId

    try {
      await createReviewMutation(values) // Call the tRPC mutation with form values
    } catch (error) {
      // Errors are handled by the `onError` callback of the mutation hook.
      // This catch block is primarily for unexpected errors that might occur
      // *before* the mutation is even sent (e.g., network issues, client-side validation not caught by RHF).
      console.error('Unexpected error during review submission:', error)
      toast.error(
        'An unexpected error occurred during submission. Please try again.',
      )
    }
  }

  return (
    <Dialog
      onOpenChange={setIsDialogOpen}
      open={isDialogOpen}
    >
      <DialogTrigger asChild>
        <Button
          className='rounded-lg bg-black/10 px-4 py-2 font-light text-black hover:bg-transparent'
          size='sm'
        >
          <Plus className='mr-2 h-4 w-4' /> Add New Review
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Review</DialogTitle>
          <DialogDescription>
            Please fill in the form below to add a new review.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name='rating'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className='flex items-center space-x-3'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          disabled={isSubmitting}
                          key={star}
                          onClick={() => field.onChange(star)}
                          type='button' // Disable while submitting
                        >
                          <StarIcon
                            className={cn(
                              star <= field.value
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-400',
                            )}
                            size={30}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Please rate the staff based on your experience.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      disabled={isSubmitting}
                      placeholder='Write your review here...' // Disable while submitting
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please write a detailed review of your experience.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className='w-full'
              disabled={isSubmitting} // Use tRPC's isSubmitting state
              type='submit'
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
