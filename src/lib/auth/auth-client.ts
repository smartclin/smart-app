import {
	adminClient,
	anonymousClient,
	inferAdditionalFields,
	multiSessionClient,
	passkeyClient,
} from 'better-auth/client/plugins'
import { twoFactorClient } from 'better-auth/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from '@/lib/auth'

import { ac, allRoles } from './roles'

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	plugins: [
		adminClient({
			ac,
			roles: allRoles,
		}),
		twoFactorClient(),
		passkeyClient(),
		multiSessionClient(),
		anonymousClient(),
		inferAdditionalFields<typeof auth>(),
	],
})

export const {
	signIn,
	signOut,
	signUp,
	updateUser,
	changePassword,
	changeEmail,
	deleteUser,
	useSession,
	revokeSession,
	resetPassword,
	linkSocial,
	forgetPassword,
	listAccounts,
	listSessions,
	revokeOtherSessions,
	revokeSessions,
} = authClient

export function useUser() {
	const session = useSession()
	return session.data?.user
}

export function useRole() {
	const session = useSession()
	return session.data?.user?.role
}

export function useIsAdmin() {
	const role = useRole()
	return role === 'admin'
}
export const signInWithGithub = async () => {
	try {
		const data = await signIn.social({
			provider: 'github',
		})
		return data
	} catch (error) {
		console.error('GitHub signin error:', error)
		throw error
	}
}
