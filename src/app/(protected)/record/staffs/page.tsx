import type { Staff } from '@prisma/client'
import { format } from 'date-fns'
import { Users } from 'lucide-react'

import { ActionDialog } from '@/components/action-dialog'
import { StaffForm } from '@/components/forms/staff-form'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { getSession } from '@/lib/auth'
import { trpc } from '@/trpc/server' // API for server fetch
import { checkRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'

const columns = [
	{ header: 'Info', key: 'name' },
	{ header: 'Role', key: 'role', className: 'hidden md:table-cell' },
	{ header: 'Phone', key: 'contact', className: 'hidden md:table-cell' },
	{ header: 'Email', key: 'email', className: 'hidden lg:table-cell' },
	{ header: 'Joined Date', key: 'createdAt', className: 'hidden xl:table-cell' },
	{ header: 'Actions', key: 'action' },
]

interface StaffListProps {
	searchParams?: { p?: string; q?: string }
}

const StaffList = async ({ searchParams = {} }: StaffListProps) => {
	const page = searchParams.p ? Number(searchParams.p) : 1
	const searchQuery = searchParams.q ?? ''

	// Fetch staff data via server-side call (not useQuery hook)
	const response = await trpc.staff.getAllStaff({
		page,
		limit: DATA_LIMIT,
		search: searchQuery,
	})

	if (!response || !response.data) return null

	const data = response.data
	const totalRecords = response.totalRecords
	const totalPages = response.totalPages
	const currentPage = response.currentPage

	// Get user session and check role (server side)
	const session = await getSession()
	const isAdmin = await checkRole(session, 'ADMIN')

	const renderRow = (item: Staff) => (
		<tr
			className="border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50"
			key={item.id}
		>
			<td className="flex items-center gap-4 p-4">
				<ProfileImage
					bgColor={item.colorCode ?? '0000'}
					name={item.name}
					textClassName="text-black"
					url={item.img ?? ''}
				/>
				<div>
					<h3 className="uppercase">{item.name}</h3>
					<span className="text-sm capitalize">{item.phone}</span>
				</div>
			</td>
			<td className="hidden md:table-cell">{item.role}</td>
			<td className="hidden md:table-cell">{item.phone}</td>
			<td className="hidden lg:table-cell">{item.email}</td>
			<td className="hidden xl:table-cell">{format(new Date(item.createdAt), 'yyyy-MM-dd')}</td>
			<td>
				<div className="flex items-center gap-2">
					<ActionDialog
						data={item}
						id={item.id}
						type="staff"
					/>
					{isAdmin && (
						<ActionDialog
							deleteType="staff"
							id={item.id}
							type="delete"
						/>
					)}
				</div>
			</td>
		</tr>
	)

	return (
		<div className="rounded-xl bg-white px-3 py-6 2xl:px-6">
			<div className="flex items-center justify-between">
				<div className="hidden items-center gap-1 lg:flex">
					<Users
						className="text-gray-500"
						size={20}
					/>
					<p className="font-semibold text-2xl">{totalRecords}</p>
					<span className="text-gray-600 text-sm xl:text-base">total staffs</span>
				</div>

				<div className="flex w-full items-center justify-between gap-2 lg:w-fit lg:justify-start">
					<SearchInput defaultValue={searchQuery} />
					{isAdmin && <StaffForm />}
				</div>
			</div>

			<div className="mt-4">
				<Table
					columns={columns}
					data={data}
					renderRow={renderRow}
				/>

				{totalPages > 1 && (
					<Pagination
						currentPage={currentPage}
						limit={DATA_LIMIT}
						totalPages={totalPages}
						totalRecords={totalRecords}
					/>
				)}
			</div>
		</div>
	)
}

export default StaffList
