import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin, anonymous } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { cache } from 'react'

import { ac, allRoles } from './roles'
import { db } from '@/db'

// The betterAuth instance is exported as a named constant, as required by the CLI.
export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql',
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || ''],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},

	user: {
		additionalFields: {
			isAnonymous: {
				type: 'boolean',
				required: false,
				defaultValue: true,
			},
			messageCount: {
				type: 'number',
				required: false,
				defaultValue: 0,
			},
			imageCount: {
				type: 'number',
				required: false,
				defaultValue: 0,
			},
			lastReset: {
				type: 'date',
				required: false,
			},
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
		anonymous({
			onLinkAccount: async ({ newUser }) => {
				await db.user.update({
					where: {
						id: newUser.user.id,
					},
					data: {
						isAnonymous: false,
					},
				})
			},
		}),
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
