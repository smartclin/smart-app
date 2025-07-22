// src/trpc/server.ts
import 'server-only' // Ensures this module only runs on the server

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cookies, headers } from 'next/headers'
import { cache } from 'react'

import { type AppRouter, createCaller as createTRPCAppCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

import { makeQueryClient } from './query-client' // Your shared QueryClient factory

/**
 * Creates the tRPC context for React Server Components.
 * This context is memoized per request using `cache` to ensure efficient context creation.
 * It includes headers and cookies for full request context.
 *
 * @returns A Promise that resolves to the tRPC context object.
 */
export const createContext = cache(async () => {
	const heads = new Headers(await headers())
	heads.set('x-trpc-source', 'rsc')

	return createTRPCContext({
		headers: heads,
		cookies: await cookies(),
	})
})

/**
 * Memoized instance of the QueryClient for server-side operations.
 * This ensures the same QueryClient instance is used throughout a single request.
 * It leverages the shared `makeQueryClient` from `./query-client.ts` for consistent configuration.
 */
const getQueryClient = cache(makeQueryClient)

/**
 * Creates a memoized server-side tRPC caller for the current request.
 * This `caller` is used by `createHydrationHelpers` to execute tRPC procedures directly on the server.
 * It bypasses HTTP calls, making it highly efficient for RSC data fetching.
 */
const caller = createTRPCAppCaller(createContext)

/**
 * Exports the tRPC API proxy (`api`) and the `HydrateClient` component.
 *
 * `api`: A proxy client that allows you to call your tRPC procedures directly
 * within React Server Components (e.g., `await api.post.getById({ id: '...' });`).
 * These calls execute directly on the server, benefiting from zero-payload data fetching.
 *
 * `HydrateClient`: A Client Component that consumes the dehydrated React Query state
 * generated on the server and rehydrates the client-side React Query cache.
 * This prevents refetching data already fetched on the server, ensuring
 * fast initial page loads.
 */
export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient,
)
