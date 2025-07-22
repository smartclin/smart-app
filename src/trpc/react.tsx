'use client' // This directive is essential for client components in Next.js App Router

// Sort imports for Biome (lint/correctness/organizeImports)
import { QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson' // For proper serialization of dates, etc.

import type { AppRouter } from'@/trpc/routers/_app' // Import your AppRouter type from the server

import { makeQueryClient } from './query-client'

// 1. Create the tRPC React client instance
// This 'trpc' object will contain all your useQuery, useMutation, etc. hooks
export const trpc = createTRPCReact<AppRouter>()

// 2. Define the TRPCProvider component
// This component wraps your application and provides the tRPC client and React Query client
export function TRPCProvider(props: { children: React.ReactNode }) {
	// Use makeQueryClient to create the QueryClient instance.
	const [queryClient] = useState(makeQueryClient)

	// State to hold the tRPC client instance
	const [trpcClient] = useState(() =>
		trpc.createClient({
			// Configure the links for your tRPC client
			links: [
				// 1. Logger Link: Logs tRPC calls in development for debugging
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),
				// 2. HTTP Batch Link: Batches requests to your tRPC endpoint
				httpBatchLink({
					// FIX: Use template literal for URL (lint/style/useTemplate)
					url: `${getBaseUrl()}/api/trpc`,
					headers() {
						// This is where you might add Authorization headers if using external auth
						// const token = getAuthTokenFromLocalStorageOrCookie();
						// return token ? { Authorization: `Bearer ${token}` } : {};
						return {}
					},
					// FIX: superjson transformer MUST be here for httpBatchLink
					transformer: superjson,
				}),
			],
			// FIX: Remove transformer from here. It is handled by the links.
			// transformer: superjson,
		}),
	)

	return (
		// QueryClientProvider should typically wrap trpc.Provider
		<QueryClientProvider client={queryClient}>
			<trpc.Provider
				client={trpcClient}
				queryClient={queryClient}
			>
				{props.children}
			</trpc.Provider>
		</QueryClientProvider>
	)
}

/**
 * Helper function to determine the base URL for your tRPC API.
 * This handles both client-side and server-side (for API routes) environments.
 * It's crucial for Vercel deployments.
 */
function getBaseUrl() {
	// Check if running in a browser environment
	if (typeof window !== 'undefined') {
		return '' // Browser will automatically use the current domain (relative path)
	}
	// Check if Vercel deployment (next.js production environment)
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`
	}
	// Fallback for local development or other environments
	return `http://localhost:${process.env.PORT ?? 3000}`
}
