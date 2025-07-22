'use client' // This directive is essential for client components in Next.js App Router

// Sort imports for Biome (lint/correctness/organizeImports)
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson' // For proper serialization of dates, etc.
import { createTRPCClient } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { AppRouter } from '@/trpc/routers/_app' // Import your AppRouter type from the server
import { TRPCProvider } from '@/lib/trpc'


// 1. Create the tRPC React client instance
// This 'trpc' object will contain all your useQuery, useMutation, etc. hooks
export const trpc = createTRPCReact<AppRouter>()

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
			},
		},
	})
}
let browserQueryClient: QueryClient | undefined
function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always make a new query client
		return makeQueryClient()
	}
	// Browser: make a new query client if we don't already have one
	// This is very important, so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient()
	return browserQueryClient
}
// 2. Define the TRPCProvider component
// This component wraps your application and provides the tRPC client and React Query client
export function TrpcReactProvider({ children }: { children: React.ReactNode }) {
	// Use makeQueryClient to create the QueryClient instance.
	const queryClient = getQueryClient()

	// State to hold the tRPC client instance
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
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
					transformer: superjson,

					// FIX: Use template literal for URL (lint/style/useTemplate)
					url: `${getBaseUrl()}/api/trpc`,
					headers() {
						const headers = new Headers()
						headers.set('x-trpc-source', 'nextjs-react')
						return headers
					},
				}),
			],
		}),
	)

	return (
		// QueryClientProvider should typically wrap trpc.Provider
		<QueryClientProvider client={queryClient}>
			<TRPCProvider
				trpcClient={trpcClient}
				queryClient={queryClient}
			>
				{children}
			</TRPCProvider>
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
