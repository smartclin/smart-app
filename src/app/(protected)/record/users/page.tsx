'use client' // This component appears to be a client component

import { format } from 'date-fns'
import { BriefcaseBusiness } from 'lucide-react'

import { Table } from '@/components/tables/table'
import { auth } from '@/lib/auth' // Ensure this correctly points to your Better Auth instance

// 1. Updated UserProps to match the desired display and better align with inferred API structure
interface UserProps {
	id: string
	firstName: string | null // Keep if you explicitly need to display these, derive if only 'name' exists
	lastName: string | null // Keep if you explicitly need to display these, derive if only 'name' exists
	name: string
	email: string
	emailVerified: boolean
	role: string | null // Better Auth supports single string or array of strings for role
	createdAt: Date // Transformed to Date object for display
	updatedAt: Date // Transformed to Date object for display
	status: 'active' | 'inactive' | string // Assuming 'status' is derived/fixed, or add to API type if it comes from there
	lastSignInAt: Date | null // Common for user records, assuming timestamp or Date from API
}

// 2. Define ApiUser based on the "Better Auth" `admin.listUsers` documentation and common patterns.
// This assumes createdAt and updatedAt are Unix timestamps (numbers).
// Adjust to `Date` if your `auth.api.listUsers` returns Date objects directly.
type ApiUser = {
	id: string
	name: string | null // Assuming 'name' can be null, default to 'N/A'
	email: string // Assuming email is always present and non-nullable
	role?: string | string[] | null // Better Auth supports string or string[], and can be optional/null
	emailVerified?: boolean // Often optional, default to false
	createdAt: Date // Assuming Unix timestamp in milliseconds
	updatedAt: Date // Assuming Unix timestamp in milliseconds
	lastSignInAt?: number | null // Assuming Unix timestamp or null
	// If firstName/lastName are separate in Better Auth's actual user schema (not just 'name'):
	firstName?: string | null
	lastName?: string | null
	// If you add custom fields to 'data' in `createUser`, they'd appear here.
	// data?: { [key: string]: unknown };
}

// Columns for your table. No changes needed here, just ensures consistency.
const columns = [
	{ header: 'User ID', key: 'id', className: 'hidden lg:table-cell' },
	{ header: 'Name', key: 'name' },
	{ header: 'Email', key: 'email', className: 'hidden md:table-cell' },
	{ header: 'Role', key: 'role' },
	{ header: 'Status', key: 'status' },
	{ header: 'Email Verified', key: 'emailVerified', className: 'hidden xl:table-cell' },
	{ header: 'Last Sign In', key: 'lastSignInAt', className: 'hidden md:table-cell' }, // Added for lastSignInAt
]

const UserPage = async () => {
	// Cast the result from auth.api.listUsers to ApiUser[]
	const { users, total } = (await auth.api.listUsers({
		query: {
			sortBy: 'createdAt', // Better Auth uses 'createdAt' as a string for sortBy
			sortDirection: 'desc',
		},
	})) as { users: ApiUser[]; total: number } // Explicitly cast for stricter typing

	if (!users) {
		return <div className="p-4 text-center text-gray-500">No users found or still loading...</div>
	}

	// 3. Map ApiUser to UserProps
	const mappedUsers: UserProps[] = users.map((user: ApiUser) => {
		// Handle role: If it's an array, take the first, otherwise use as is. Default to null.
		const userRole = Array.isArray(user.role) ? user.role[0] : (user.role ?? null)

		// Derive firstName/lastName from name if not directly available, or just use name
		const parts = (user.name ?? '').split(' ')
		const firstName = user.firstName ?? parts[0] ?? null
		const lastName = user.lastName ?? (parts.length > 1 ? parts.slice(1).join(' ') : null)

		return {
			id: user.id,
			firstName: firstName,
			lastName: lastName,
			name: user.name ?? 'N/A', // Use API's name or a default
			email: user.email, // Assuming email is always present
			emailVerified: user.emailVerified ?? false, // Default to false if not provided
			role: userRole ?? '',
			// Convert timestamps to Date objects
			createdAt: new Date(user.createdAt),
			updatedAt: new Date(user.updatedAt),
			status: 'active', // Hardcoded as per your initial renderRow, adjust if dynamic
			lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null, // Convert timestamp or null
		}
	})

	// 4. `renderRow` function now correctly uses properties from `UserProps`
	const renderRow = (item: UserProps) => (
		<tr
			className="border-gray-200 border-b text-base even:bg-slate-50 hover:bg-slate-50"
			key={item.id}
		>
			<td className="hidden items-center lg:table-cell">{item.id}</td>
			<td className="table-cell py-2 xl:py-4">
				{/* Displaying full name from item.name, or constructed if firstName/lastName used */}
				{item.name}
			</td>
			<td className="table-cell">{item.email}</td>
			<td className="table-cell capitalize">{item.role ?? 'N/A'}</td> {/* Handle null role */}
			<td className="hidden capitalize md:table-cell">{item.status}</td>
			<td className="hidden capitalize xl:table-cell">
				{item.emailVerified ? 'Verified' : 'Unverified'}
			</td>
			<td className="hidden capitalize md:table-cell">
				{item.lastSignInAt ? format(item.lastSignInAt, 'yyyy-MM-dd h:mm:ss') : 'Never'}
			</td>
		</tr>
	)

	return (
		<div className="rounded-xl bg-white p-2 md:p-4 2xl:p-6">
			<div className="flex items-center justify-between">
				<div className="hidden items-center gap-1 lg:flex">
					<BriefcaseBusiness
						className="text-gray-500"
						size={20}
					/>
					<p className="font-semibold text-2xl">{total}</p>
					<span className="text-gray-600 text-sm xl:text-base">total users</span>
				</div>
			</div>

			<div>
				<Table
					columns={columns}
					data={mappedUsers}
					renderRow={renderRow}
				/>
			</div>
		</div>
	)
}

export default UserPage
