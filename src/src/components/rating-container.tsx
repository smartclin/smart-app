// src/components/rating-container.tsx

// FIX: Import 'caller' instead of 'trpc' for direct server-side calls
import { trpc } from '@/trpc/server'

import { RatingChart } from './charts/rating-chart'
import { RatingList } from './rating-list'

// Define the expected type for a single rating item with patient details
// This type should match what your getRatingById procedure returns.
// You might want to put this in a shared types file (e.g., src/lib/types.ts)
interface RatingWithPatient {
	id: number
	createdAt: Date
	updatedAt: Date
	rating: number
	patientId: string
	staffId: string // Assuming staffId is part of your rating model
	comment: string | null
	patient: {
		firstName: string
		lastName: string
	}
}

export const RatingContainer = async ({ id }: { id: string }) => {
	// FIX: Use 'caller' to directly call the tRPC procedure
	const result = await trpc.doctor.getRatingById(id)

	// Ensure the structure matches what you're destructuring
	// Based on the error message type, it seems your tRPC procedure returns an object
	// directly containing totalRatings, averageRating, and ratings.
	const { ratings, totalRatings, averageRating } = result

	return (
		<div className="space-y-4">
			<RatingChart
				averageRating={Number(averageRating ?? 10)} // Ensure averageRating is a number
				totalRatings={totalRatings ?? 50} // Ensure totalRatings is a number
			/>
			<RatingList
				data={(ratings ?? []).map((rating: RatingWithPatient) => ({
					// Explicitly type 'rating'
					...rating,
					comment: rating.comment === null ? undefined : rating.comment,
				}))}
			/>
		</div>
	)
}
