import { NextResponse } from 'next/server'

import { getSession } from './lib/auth'
import { routeAccess, type UserRole } from './lib/routes'

const matchers = Object.entries(routeAccess).map(([pattern, allowedRoles]) => ({
	pattern: new RegExp(`^${pattern}`),
	allowedRoles,
}))

function isValidUserRole(role: unknown): role is UserRole {
	return ['admin', 'doctor', 'nurse', 'patient'].includes(role as string)
}

export async function middleware(req: Request) {
	const url = new URL(req.url)
	const pathname = url.pathname

	// Pass req if needed inside getSession implementation
	const session = await getSession()
	const rawRole = session?.user?.role
	const role = isValidUserRole(rawRole) ? rawRole : null

	const matched = matchers.find(({ pattern }) => pattern.test(pathname))

	if (matched) {
		if (!role) {
			// Unauthenticated → redirect to signin
			return NextResponse.redirect(new URL('/signin', url.origin))
		}

		if (!matched.allowedRoles.includes(role)) {
			// Authenticated but unauthorized → redirect to role root
			return NextResponse.redirect(new URL(`/${role}`, url.origin))
		}
	}

	const res = NextResponse.next()

	// Add CORS headers on API routes only
	if (pathname.startsWith('/api') || pathname.startsWith('/trpc')) {
		res.headers.append('Access-Control-Allow-Credentials', 'true')
		res.headers.append(
			'Access-Control-Allow-Origin',
			process.env.CORS_ORIGIN ?? '*', // default to '*'
		)
		res.headers.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
		res.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	}
	return res
}

export const config = {
	runtime: 'nodejs',
	matcher: [
		// Include all but next internals and static assets
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/(api|trpc)(.*)',
	],
}
