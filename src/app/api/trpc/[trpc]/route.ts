// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { cookies as getCookies, headers as getHeaders } from 'next/headers';

import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

const handler = async (req: Request) => {
  const rawHeaders = await getHeaders(); // ⛳️ required
  const rawCookies = await getCookies(); // ⛳️ required

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        req,
        opts: {
          headers: rawHeaders,
          cookies: rawCookies
        }
      })
  });
};

export { handler as GET, handler as POST };
