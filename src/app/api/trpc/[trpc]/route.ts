// src/app/api/trpc/[trpc]/route.ts

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { NextRequest } from 'next/server'

import { appRouter } from'@/trpc/routers/_app'
import { createContext } from '@/trpc/server' // Import createContext from trpc/server

async function handler(req: NextRequest) {
	return fetchRequestHandler({
		endpoint: '/api/trpc',
		req,
		router: appRouter,
		createContext: () => createContext(), // Use the imported createContext
	})
}

export { handler as GET, handler as POST }
