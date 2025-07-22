// src/trpc/query-client.ts
import {
	defaultShouldDehydrateQuery,
	MutationCache,
	QueryCache,
	QueryClient,
} from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import { toast } from 'sonner'; // Assuming 'sonner' for toasts
import superjson from 'superjson'; // Correct import and usage (lowercase s)

// Define the function correctly
export const createQueryClient = () => {
	// Instantiate QueryClient with a single, consolidated defaultOptions object
	const queryClient = new QueryClient({
		// Default options applied to all queries and mutations
		defaultOptions: {
			queries: {
				// How long query data remains fresh (stale) before it's refetched in the background.
				// For SSR, a positive staleTime avoids immediate refetch on client mount.
				// 5 minutes is a common sensible default for non-critical data.
				staleTime: 5 * 60 * 1000, // 5 minutes

				// How long unused/inactive query data stays in the cache before it's garbage collected.
				// Should generally be longer than staleTime. If gcTime is less than staleTime,
				// data might be garbage collected while still considered fresh, leading to refetches.
				// Setting it to 10 minutes ensures data persists longer even if no components use it.
				gcTime: 10 * 60 * 1000, // 10 minutes

				// Automatically refetch queries when the window regains focus.
				// Good for keeping data fresh, but set to 'always' for very active apps,
				// or 'false' for data that changes infrequently. `true` is usually a good default.
				refetchOnWindowFocus: true,

				// Automatically refetch queries when a component mounts.
				// Set to `true` for general freshness, `false` for stable data or if you rely on staleTime.
				refetchOnMount: true,

				// Automatically refetch queries when the network connection is re-established.
				refetchOnReconnect: true,

				// Default number of times to retry a failed query.
				// 3 retries is a standard robust default for transient network issues.
				retry: 3,

				// If set to true, queries that are currently fetching will not re-fetch.
				// This prevents duplicate requests for the same query key.
				retryOnMount: true, // Typically true to avoid immediate refetch on mount if it's already fetching.
			},
			mutations: {
				// Default retry for mutations. Often set to 0 as mutations
				// usually have side effects and automatic retries can be risky.
				retry: 0,
			},
			dehydrate: {
				// Correctly use `superjson` (lowercase s)
				serializeData: superjson.serialize,
				// Ensure pending queries are also dehydrated for a smoother SSR experience
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
			},
			hydrate: {
				// Correctly use `superjson` (lowercase s)
				deserializeData: superjson.deserialize,
			},
		},

		// Configure QueryCache for global error handling for queries
		queryCache: new QueryCache({
			onError: (error, query) => {
				let errorMessage: string = 'An unexpected error occurred with your data. Please try again.';
				let showRetryAction: boolean = false;

				if (error instanceof TRPCClientError) {
					errorMessage = error.message; // Start with the tRPC-provided message

					switch (error.data?.code) {
						case 'UNAUTHORIZED':
						case 'FORBIDDEN':
							errorMessage = 'You are not authorized to access this data.';
							showRetryAction = false; // No retry for auth errors
							break;
						case 'BAD_REQUEST':
						case 'VALIDATION_ERROR':
							errorMessage = error.message; // Use specific message from tRPC for validation
							showRetryAction = false; // No retry for client-side input errors
							break;
						case 'NOT_FOUND':
							errorMessage = 'The requested resource was not found.';
							showRetryAction = false;
							break;
						case 'INTERNAL_SERVER_ERROR':
							errorMessage = 'Server error. We are working to fix it.';
							showRetryAction = true; // Retry for server-side issues
							break;
						case 'PARSE_ERROR':
						case 'TIMEOUT':
						case 'CLIENT_CLOSED_REQUEST':
						case 'CANCELED_REQUEST':
						case 'UNKNOWN_SERVER_ERROR':
						case 'SERVER_ERROR': // General server errors
							errorMessage = 'Network or server issue. Please check your connection or try again.';
							showRetryAction = true; // Retry for network/transient server errors
							break;
						default:
							showRetryAction = true; // Default to retry for unknown tRPC errors
							break;
					}
				} else if (error instanceof Error) {
					// General JavaScript errors (e.g., in a queryFn before tRPC client call)
					errorMessage = `Client-side error: ${error.message}`;
					showRetryAction = true;
				} else {
					// Fallback for non-Error objects (unlikely in tRPC context but good for robustness)
					console.error('Unknown query error type:', error);
				}

				toast.error(
					errorMessage,
					showRetryAction
						? {
							action: {
								label: 'Retry',
								onClick: () => query.fetch(), // `query` is definitely defined here
							},
							duration: 7000, // Longer duration for retryable errors
						}
						: {
							duration: 5000,
						},
				);
			},
		}),

		// Configure MutationCache for global error handling and success messages for mutations
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, _mutation) => {
				let errorMessage: string = 'An operation failed. Please try again.';

				if (error instanceof TRPCClientError) {
					errorMessage = error.message;

					switch (error.data?.code) {
						case 'UNAUTHORIZED':
						case 'FORBIDDEN':
							errorMessage = 'You are not authorized to perform this action.';
							break;
						case 'BAD_REQUEST':
						case 'VALIDATION_ERROR':
							errorMessage = error.message; // Use specific message for validation
							break;
						case 'NOT_FOUND':
							errorMessage = 'The target resource was not found.';
							break;
						case 'INTERNAL_SERVER_ERROR':
						case 'PARSE_ERROR':
						case 'TIMEOUT':
						case 'CLIENT_CLOSED_REQUEST':
						case 'CANCELED_REQUEST':
						case 'UNKNOWN_SERVER_ERROR':
						case 'SERVER_ERROR':
							errorMessage = 'Network or server issue during operation. Please try again.';
							break;
						default:
							break; // Use the default errorMessage
					}
				} else if (error instanceof Error) {
					errorMessage = `Client-side operation error: ${error.message}`;
				}

				toast.error(errorMessage, {
					duration: 5000,
					// Consider adding an 'Undo' action here if your mutation logic supports it.
					// For example, if you have an optimistic update that needs rolling back.
				});
			},
			onSuccess: (_data, _variables, _context, _mutation) => {
				// This is a general success toast.
				// For specific mutation successes, you might use `onSuccess` directly in `useMutation` hook.
				// Keeping a general one provides a fallback.
				// toast.success('Operation completed successfully!');
			},
		}),
	});

	return queryClient;
};