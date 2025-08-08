import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { cookies, headers } from 'next/headers'
import type { NextRequest } from 'next/server'

import { env } from '@/env'
import { createTRPCContext } from '@/trpc/init'
import { appRouter } from '@/trpc/routers/_app'

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    req,
    opts: {
      headers: await headers(),
      cookies: await cookies(), // next/headers returns ReadonlyRequestCookies
    },
  })
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
