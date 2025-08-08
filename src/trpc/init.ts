// src/server/trpc/init.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { cache } from 'react'
import superjson from 'superjson'
import { ZodError } from 'zod'

import db from '@/db'
import { auth } from '@/lib/auth'
import type { ReadonlyRequestCookies } from '@/types/globals'

// Cached session resolver
const getSession = cache(auth.api.getSession)

export interface CreateContextOptions {
  headers: Headers
  cookies: ReadonlyRequestCookies
}

/**
 * Create tRPC context for both API routes and RSC calls.
 */
export const createTRPCContext = async ({
  req,
  opts,
}: {
  req: Request
  opts: CreateContextOptions
}) => {
  const session = await getSession({ headers: opts.headers })

  return {
    db,
    session,
    user: session?.user ?? null,
    req,
    ...opts,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

// --- tRPC Core Init ---
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory

// --- Middleware ---
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in.',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // guaranteed non-null here
    },
  })
})

const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access only.' })
  }
  return next()
})

const devTiming = t.middleware(async ({ next }) => {
  if (process.env.NODE_ENV === 'development') {
    await new Promise((r) => setTimeout(r, Math.random() * 400 + 100))
  }
  return next()
})

// --- Procedure Shortcuts ---
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure.use(devTiming)
export const protectedProcedure = t.procedure.use(devTiming).use(isAuthed)
export const adminProcedure = t.procedure
  .use(devTiming)
  .use(isAuthed)
  .use(isAdmin)
