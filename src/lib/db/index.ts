// Re-export Prisma types and generated modules
export { Prisma, PrismaClient } from '@prisma/client'
export * from '@prisma/client/enums'
export * from '@prisma/client/models'

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

import { env } from '@/env'

// Factory function to create and extend PrismaClient
const createPrismaClient = () =>
	new PrismaClient({
		log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
	}).$extends(withAccelerate())

// Ensure a single PrismaClient instance during development (for hot-reloading)
const globalForPrisma = globalThis as unknown as {
	prisma?: ReturnType<typeof createPrismaClient>
}

// Singleton client instance
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = db
}

export default db
