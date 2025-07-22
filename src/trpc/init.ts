import { initTRPC, TRPCError } from '@trpc/server'
import { cache } from 'react'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { auth } from '@/lib/auth' // Assuming you have an auth utility
import db from '@/lib/db' // Assuming you have a database client (e.g., Prisma)
import type { ReadonlyRequestCookies } from '@/types/globals'

const getSession = cache(auth.api.getSession)
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 * These allow you to access things when processing a request, like the db, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

// Define the shape of the options passed to createTRPCContext
interface CreateContextOptions {
	headers: Headers
	cookies: ReadonlyRequestCookies // Type for Next.js cookies() return
}

/**
 * This is the actual tRPC context factory that will be called for each request.
 * It's responsible for creating an object containing your dependencies (e.g., database client, session data).
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: CreateContextOptions) => {
	const session = await getSession({
		headers: opts.headers,
	})
	return {
		db,
		session,
		...opts,
		user: session?.user,
	}
}
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get type-safety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson, // For handling Date, Map, Set, etc. serialization
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		}
	},
})

export const isAdmin = t.middleware(({ ctx, next }) => {
	if (!ctx.session?.user || ctx.session.user.role !== 'ADMIN') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access only' })
	}
	return next()
})

// Admin protected procedure
export const adminProcedure = t.procedure.use(isAdmin)
/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now()

	if (t._config.isDev) {
		// artificial delay in dev
		const waitMs = Math.floor(Math.random() * 400) + 100
		await new Promise(resolve => setTimeout(resolve, waitMs))
	}

	const result = await next()

	const end = Date.now()
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

	return result
})

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You must be authenticated to access this route.',
		})
	}

	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})
