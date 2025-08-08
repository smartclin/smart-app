// db.ts

import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from 'generated/client/client';

import { env } from '@/env';

// Factory function to create the extended PrismaClient
const createClient = () =>
  new PrismaClient({
    transactionOptions: {
      isolationLevel: 'ReadCommitted',
      timeout: 10000,
      maxWait: 10000
    },
    errorFormat: 'pretty',
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error']
  }).$extends(withAccelerate());

// Global singleton pattern (for dev hot-reloading)
const globalForPrisma = globalThis as unknown as {
  __PRISMA__: ReturnType<typeof createClient> | undefined;
};

// Only create a new client if not already present
const client = globalForPrisma.__PRISMA__ ?? createClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.__PRISMA__ = client;
}

// Export single instance
export const db = client;
export default db;
