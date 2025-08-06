// src/app/(protected)/record/patients/page.tsx

import type { Patient } from '@prisma/client' // Keep this if Patient is a base type
import { format } from 'date-fns'
import { UserPen, Users } from 'lucide-react'

import { ActionDialog } from '@/components/action-dialog'
import { ActionOptions, ViewAction } from '@/components/action-options'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth'
import { trpc } from '@/trpc/server' // Assuming this is your tRPC server client
import type { SearchParamsProps } from '@/types'
import { calculateAge } from '@/utils'
import { checkRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'

const columns = [
	{
		header: 'Patient Name',
		key: 'name',
	},
	{
		header: 'Gender',
		key: 'gender',
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
		header: 'Address',
		key: 'address',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Last Visit',
		key: 'created_at',
		className: 'hidden lg:table-cell',
	},
	{
		header: 'Last Treatment',
		key: 'treatment',
		className: 'hidden 2xl:table-cell',
	},
	{
		header: 'Actions',
		key: 'action',
	},
]

// FIX IS HERE: Change `string | undefined` to `string | null` for `treatmentPlan`
interface PatientProps extends Patient {
	appointments: {
		medical: {
			createdAt: Date
			treatmentPlan: string | null // <--- Changed from `string | undefined` to `string | null`
		}[]
	}[]
}

const PatientList = async (props: SearchParamsProps) => {
	const searchParams = await props.searchParams
	const page = (searchParams?.p || '1') as string
	const searchQuery = (searchParams?.q || '') as string
	const session = await getSession()

	// Assuming trpc.patient.getAllPatients returns a structure compatible with PatientProps[]
	// The error indicates the returned data's `treatmentPlan` is `string | null`.
	const { data, totalPages, totalRecords, currentPage } = (await trpc.patient.getAllPatients({
		page,
		search: searchQuery,
	})) as unknown as {
		data: PatientProps[]
		totalPages: number
		totalRecords: number
		currentPage: number
	}

	if (!data) return null // Consider returning a loading state or empty table message

	const isAdmin = await checkRole(session, 'ADMIN')

	const renderRow = (item: PatientProps) => {
		// Access `medical[0]` with optional chaining and default to null for safety
		const lastVisit = item.appointments?.[0]?.medical?.[0] || null

		// Ensure firstName and lastName are handled if they are null
		const name = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()

		return (
			<tr
				className="border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50"
				key={item.id} // Use item.id directly, it's guaranteed by PatientProps
			>
				<td className="flex items-center gap-4 p-4">
					<ProfileImage
						bgColor={item.colorCode ?? '0000'} // Use item.colorCode directly
						name={name}
						textClassName="text-black"
						url={item.img ?? ''} // Use item.img directly
					/>
					<div>
						<h3 className="uppercase">{name}</h3>
						<span className="text-sm capitalize">{calculateAge(item.dateOfBirth)}</span>
					</div>
				</td>
				<td className="hidden md:table-cell">{item.gender}</td>
				<td className="hidden md:table-cell">{item.phone}</td>
				<td className="hidden lg:table-cell">{item.email}</td>
				<td className="hidden xl:table-cell">{item.address}</td>
				<td className="hidden xl:table-cell">
					{/* Access createdAt with optional chaining */}
					{lastVisit?.createdAt ? (
						format(lastVisit.createdAt, 'yyyy-MM-dd HH:mm:ss')
					) : (
						<span className="text-gray-400 italic">No last visit</span>
					)}
				</td>
				<td className="hidden xl:table-cell">
					{/* Access treatmentPlan with optional chaining */}
					{lastVisit?.treatmentPlan ? (
						lastVisit.treatmentPlan
					) : (
						<span className="text-gray-400 italic">No last treatment</span>
					)}
				</td>
				<td>
					<div className="flex items-center gap-2">
						<ViewAction href={`/patient/${item.id}`} />

						<ActionOptions>
							<div className="space-y-3">
								<Button
									className="font-light text-xs"
									variant={'ghost'}
								>
									<UserPen size={16} />
									Edit
								</Button>

								{isAdmin && (
									<ActionDialog
										deleteType="patient"
										id={item.id}
										type="delete"
									/>
								)}
							</div>
						</ActionOptions>
					</div>
				</td>
			</tr>
		)
	}

	return (
		<div className="rounded-xl bg-white px-3 py-6 2xl:px-6">
			<div className="flex items-center justify-between">
				<div className="hidden items-center gap-1 lg:flex">
					<Users
						className="text-gray-500"
						size={20}
					/>

					<p className="font-semibold text-2xl">{totalRecords}</p>
					<span className="text-gray-600 text-sm xl:text-base">total patients</span>
				</div>
				<div className="flex w-full items-center justify-between gap-2 lg:w-fit lg:justify-start">
					<SearchInput />
				</div>
			</div>

			<div className="mt-4">
				<Table
					columns={columns}
					data={data} // `data` is now correctly typed as PatientProps[]
					renderRow={renderRow}
				/>

				{totalPages && (
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

export default PatientList
