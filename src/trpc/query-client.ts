// src/trpc/query-client.ts
import {
	defaultShouldDehydrateQuery,
	MutationCache,
	QueryCache,
	QueryClient,
} from '@tanstack/react-query'
import { TRPCClientError } from '@trpc/client'
import { toast } from 'sonner'
import superjson from 'superjson'

export function makeQueryClient() {
	const queryClient = new QueryClient({
		// Configure the QueryCache directly within the QueryClient constructor
		queryCache: new QueryCache({
			onError: (error, query) => {
				let errorMessage = 'An error occurred. Please try again.'
				let retryAction = false

				if (error instanceof TRPCClientError) {
					errorMessage = error.message // Use the specific error message from tRPC
					// Specific tRPC error codes
					if (error.data?.code === 'UNAUTHORIZED' || error.data?.code === 'FORBIDDEN') {
						errorMessage = 'You are not authorized to perform this action.'
						retryAction = false // No point in retrying auth errors
					} else if (
						error.data?.code === 'BAD_REQUEST' ||
						error.data?.code === 'VALIDATION_ERROR'
					) {
						// For bad requests or validation errors, the message itself is usually sufficient
						errorMessage = error.message
						retryAction = false
					} else {
						// For other TRPCClientErrors (e.g., network, internal server), retry might be useful
						retryAction = true
					}
				} else if (error instanceof Error) {
					errorMessage = error.message
					retryAction = true // Assume general JS errors might be retryable
				}

				toast.error(
					errorMessage,
					retryAction
						? {
								action: {
									label: 'Retry',
									// Ensure query is available before calling fetch()
									onClick: () => query?.fetch(),
								},
								duration: 5000,
							}
						: {
								duration: 5000,
							},
				)
			},
		}),

		// Configure the MutationCache directly within the QueryClient constructor
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, _mutation) => {
				// FIX: Prefix unused parameters with _
				let errorMessage = 'Operation failed. Please try again.'

				if (error instanceof TRPCClientError) {
					errorMessage = error.message
					if (error.data?.code === 'UNAUTHORIZED' || error.data?.code === 'FORBIDDEN') {
						errorMessage = 'You are not authorized to perform this action.'
					} else if (
						error.data?.code === 'BAD_REQUEST' ||
						error.data?.code === 'VALIDATION_ERROR'
					) {
						errorMessage = error.message
					}
				} else if (error instanceof Error) {
					errorMessage = error.message
				}

				toast.error(errorMessage, {
					duration: 5000,
					// You could add an 'Undo' action here if your mutation logic supports it
					// action: {
					//     label: 'Undo',
					//     onClick: () => mutation.undo?.(), // Example: if you have an undo mechanism
					// },
				})
			},
			onSuccess: (_data, _variables, _context, _mutation) => {
				// FIX: Prefix unused parameters with _
				// You can keep this general success toast or remove it if you prefer
				// specific success toasts per mutation, but it's good for a fallback.
				// toast.success('Operation successful!');
			},
		}),

		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
				gcTime: 10 * 60 * 1000,
				refetchOnWindowFocus: true,
				refetchOnMount: true,
				refetchOnReconnect: true,
				retry: 3, // Global retry count for queries
			},
			// Removed mutations.onSuccess/onError here because they are already defined
			// on the mutationCache instance above. Defining them here would be redundant
			// or overridden.
			mutations: {
				// You can set general default for mutations if not set in MutationCache constructor
				// e.g. retry, but onSuccess/onError for toasts usually goes in MutationCache config.
				// retry: 0, // No default retry for mutations, often mutations are not auto-retried.
			},
			dehydrate: {
				serializeData: superjson.serialize,
				shouldDehydrateQuery: query =>
					defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
			},
			hydrate: {
				deserializeData: superjson.deserialize,
			},
		},
	})

	return queryClient
}
