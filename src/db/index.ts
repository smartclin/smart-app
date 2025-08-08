// db.ts

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

import { env } from '@/env'

const createPrismaClient = () =>
  new PrismaClient({
    transactionOptions: {
      isolationLevel: 'ReadCommitted',
      timeout: 10000,
      maxWait: 10000,
    },
    errorFormat: 'pretty',
    log:
      env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  }).$extends(withAccelerate())

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db
export default db
