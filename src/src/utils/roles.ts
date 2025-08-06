// lib/auth-role.ts

import { getSession, type Session } from '@/lib/auth' // Assuming Session type is also exported from '@/lib/auth'
// This ensures that only valid role strings are used.
export type UserRoles = 'ADMIN' | 'PATIENT' | 'STAFF' | 'DOCTOR'

export const checkRole = async (session: Session | null, roleToCheck: UserRoles) => {
	// No need to call getSession() again here, as 'session' is passed as an argument.
	// The previous error was because 'session' was already declared as a parameter.

	// Ensure session and session.user exist before accessing role
	return session?.user?.role?.toLowerCase() === roleToCheck.toLowerCase()
}

export const getRole = async (): Promise<UserRoles> => {
	const session = await getSession()

	const role = (session?.user?.role?.toLowerCase() as UserRoles) ?? 'patient'

	return role
}
export const getUser = async () => {
	const session = await getSession()

	return session?.user ?? null
}
export const getUserId = async () => {
	const session = await getSession()

	return session?.user?.id ?? null
}
export const getUserEmail = async () => {
	const session = await getSession()

	return session?.user?.email ?? null
}
export const getUserName = async () => {
	const session = await getSession()

	return session?.user?.name ?? null
}
export const getUserRole = async () => {
	const session = await getSession()

	return session?.user?.role ?? null
}
