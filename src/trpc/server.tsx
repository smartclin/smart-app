'use server'

import 'server-only'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'

import type { ReadonlyRequestCookies } from '@/types/globals'

import { createCallerFactory, createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'

// Cache query client per request
export const getQueryClient = cache(makeQueryClient)

// Cache server-side tRPC caller per request
export const getServerCaller = cache(async () => {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
	const req = new Request(baseUrl, {
		headers: new Headers(),
	})

	// ✅ You must provide actual cookies of type ReadonlyRequestCookies, not just a type reference
	const ctx = await createTRPCContext({
		req,
		opts: {
			headers: req.headers,
			cookies: new Map() as unknown as ReadonlyRequestCookies, // <- temporary stub, improve as needed
		},
	})

	return createCallerFactory(appRouter)(ctx)
})

// ✅ You must `await getServerCaller()` since it's async
const serverCaller = await getServerCaller()

// Create hydration helpers with awaited caller and cached query client
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
	serverCaller,
	getQueryClient,
)
