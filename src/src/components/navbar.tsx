'use client'

import { Bell, Home, UserCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/hooks/use-auth'

import { UserButton } from './auth/user-button'

export const Navbar = () => {
	const { user, status } = useAuth()
	const pathname = usePathname()

	function formatPathName(pathname: string | null): string {
		if (!pathname || pathname === '/') return 'Home'
		const segments = pathname.toLowerCase().split('/').filter(Boolean)
		const segment = segments[0] || 'Overview'
		return segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
	}

	const pathLabel = formatPathName(pathname)

	return (
		<nav className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
			<div className="flex items-center gap-3">
				<Home
					aria-hidden="true"
					className="h-8 w-8 text-primary-600"
				/>
				<h1 className="font-semibold text-primary-700 text-xl capitalize">{pathLabel}</h1>
			</div>

			<div className="flex items-center gap-6">
				<button
					aria-label="Notifications"
					className="relative rounded-full p-2 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
					type="button"
				>
					<Bell className="h-6 w-6 text-primary-700" />
					<span className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-600 font-semibold text-white text-xs">
						2
					</span>
				</button>

				{status === 'loading' ? (
					<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
				) : user ? (
					<UserButton
						session={user.session}
						user={user}
					/>
				) : (
					<UserCheck
						aria-label="User not logged in"
						className="h-8 w-8 text-primary-700"
					/>
				)}
			</div>
		</nav>
	)
}
