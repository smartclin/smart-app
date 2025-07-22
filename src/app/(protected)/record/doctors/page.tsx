import type { Doctor } from '@prisma/client' // Assuming this Doctor type matches the API response
import { format } from 'date-fns'
import { Users } from 'lucide-react'

import { ActionDialog } from '@/components/action-dialog'
import { ViewAction } from '@/components/action-options'
import { DoctorForm } from '@/components/forms/doctor-form'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { getSession } from '@/lib/auth'
import { api } from '@/trpc/server' // Import the tRPC server client
import type { SearchParamsProps } from '@/types'
import { checkRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'

const columns = [
	{
		header: 'Info',
		key: 'name',
	},
	{
		header: 'License #',
		key: 'license',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Phone',
		key: 'contact',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Email',
		key: 'email',
		className: 'hidden lg:table-cell',
	},
	{
		header: 'Joined Date',
		key: 'created_at',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Actions',
		key: 'action',
	},
]

const DoctorsList = async (props: SearchParamsProps) => {
	const searchParams = await props.searchParams
	const page = (searchParams?.p || '1') as string
	const searchQuery = (searchParams?.q || '') as string

	// Fetch data using the tRPC server client
	// Assuming api.doctor.getAllDoctors expects { page: number, search: string }
	const { data, totalPages, totalRecords, currentPage } = await api.doctor.getAllDoctors({
		page,
		search: searchQuery,
	})

	// Handle case where data might be null (e.g., if the tRPC procedure explicitly returns null on error/no data)
	// However, if the tRPC procedure throws on error, this check might not be reached directly
	// and the component would crash unless wrapped in an error boundary or try-catch.
	if (!data) {
		// You might want to return an error message or a loading spinner if data can be null initially
		return <div className="py-10 text-center">No doctors found or an error occurred.</div>
	}

	const session = await getSession()
	const isAdmin = await checkRole(session, 'ADMIN')

	const renderRow = (item: Doctor) => (
		<tr
			className="border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50"
			key={item?.id}
		>
			<td className="flex items-center gap-4 p-4">
				<ProfileImage
					bgColor={item?.colorCode ?? '0000'}
					name={item?.name}
					textClassName="text-black"
					url={item?.img ?? ''}
				/>
				<div>
					<h3 className="uppercase">{item?.name}</h3>
					<span className="text-sm capitalize">{item?.specialization}</span>
				</div>
			</td>
			<td className="hidden md:table-cell">{item?.licenseNumber}</td>
			<td className="hidden md:table-cell">{item?.phone}</td>
			<td className="hidden lg:table-cell">{item?.email}</td>
			<td className="hidden xl:table-cell">
				{/* Ensure item.created_at is a Date object. tRPC typically deserializes Dates automatically. */}
				{item?.createdAt ? format(item.createdAt, 'yyyy-MM-dd') : 'N/A'}
			</td>
			<td>
				<div className="flex items-center gap-2">
					<ViewAction href={`doctors/${item?.id}`} />
					{isAdmin && (
						<ActionDialog
							deleteType="doctor"
							id={item?.id}
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
					<span className="text-gray-600 text-sm xl:text-base">total doctors</span>
				</div>
				<div className="flex w-full items-center justify-between gap-2 lg:w-fit lg:justify-start">
					<SearchInput />
					{isAdmin && <DoctorForm />}
				</div>
			</div>

			<div className="mt-4">
				<Table
					columns={columns}
					data={data}
					renderRow={renderRow}
				/>

				{totalPages && ( // Only render pagination if totalPages is available
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

export default DoctorsList
