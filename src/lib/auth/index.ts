import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { cache } from 'react'

import db from '@/server/db'

import { ac, allRoles } from './roles'

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql',
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ''],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},

	user: {
		additionalFields: {
			role: {
				type: 'string',
				input: false,
			},
			firstName: {
				type: 'string',
				required: false,
			},
			lastName: {
				type: 'string',
				required: false,
			},
		},
		changeEmail: {
			enabled: true,
			requireVerification: false,
		},
		deleteUser: {
			enabled: true,
			deleteSessions: true,
		},
	},
	rateLimit: {
		enabled: true,
		storage: 'database',
	},
	appName: 'Smart Clinic App',
	plugins: [
		admin({
			ac,
			roles: allRoles,
		}),
		nextCookies(),
	],
})

// Memoized session retrieval (used in layouts, middlewares, etc.)
export const getSession = cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	})
})

export type Session = typeof auth.$Infer.Session
export type User = Session['user']
export type Role = User['role']

const authServer = auth.api
export default authServer
