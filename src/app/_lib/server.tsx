// src/server/trpc/server.tsx
import 'server-only'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cookies as getCookies, headers as getHeaders } from 'next/headers'
import { cache } from 'react'

import { createTRPCContext } from '@/trpc/init'
import { createQueryClient } from '@/trpc/query-client'
import { type AppRouter, createCaller } from '@/trpc/routers/_app'

const createContext = cache(async () => {
  const heads = new Headers(await getHeaders()) // ✅ await here
  heads.set('x-trpc-source', 'rsc')

  const cookieStore = await getCookies() // ✅ await here

  return createTRPCContext({
    req: new Request('http://localhost'),
    opts: {
      headers: heads,
      cookies: cookieStore,
    },
  })
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
)

export const trpc = api
