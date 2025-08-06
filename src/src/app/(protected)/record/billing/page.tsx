import type { Payment } from '@prisma/client'
import { format } from 'date-fns'
import { ReceiptText } from 'lucide-react'

import { ActionDialog } from '@/components/action-dialog'
import { ViewAction } from '@/components/action-options'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { getSession } from '@/lib/auth'
import { cn } from '@/lib/utils'
// import { getPaymentRecords } from '@/utils/services/payments'; // REMOVE this import
import { trpc } from '@/trpc/server' // Import the tRPC server client
import type { SearchParamsProps } from '@/types'
import { checkRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'

const columns = [
	{
		header: 'RNO',
		key: 'id',
	},
	{
		header: 'Patient',
		key: 'info',
		className: '',
	},
	{
		header: 'Contact',
		key: 'phone',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Bill Date',
		key: 'bill_date',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Total',
		key: 'total',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Discount',
		key: 'discount',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Payable',
		key: 'payable',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Paid',
		key: 'payable',
		className: 'hidden xl:table-cell', // This key should likely be 'amount_paid' not 'payable' if it represents the paid amount
	},
	{
		header: 'Status',
		key: 'status',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Actions',
		key: 'action',
	},
]

// Define a type that accurately reflects the structure of a single payment record
// as returned by your tRPC procedure, including the patient details.
type PaymentRecord = Payment & {
	patient: {
		id: string
		firstName: string
		lastName: string
		phone: string | null // Based on Prisma Patient model, phone can be null
		email: string
		address: string | null // Based on Prisma Patient model, address can be null
		dateOfBirth: Date | null // Prisma usually uses dateOfBirth, not date_of_birth
		gender: string
		img: string | null
		colorCode: string | null
	}
}

const BillingPage = async (props: SearchParamsProps) => {
	const searchParams = await props.searchParams
	const pageParam = typeof searchParams?.p === 'string' ? searchParams.p : '1'

	const page = Number(pageParam)
	const searchQuery = (searchParams?.q || '') as string

	// Use the tRPC API to fetch the data
	const {
		data: rawData,
		totalPages,
		totalRecords,
		currentPage,
	} = await trpc.payment.getPaymentRecords({
		page,
		search: searchQuery,
	})

	// Explicitly type `rawData` as an array of `PaymentRecord`
	// No mapping needed if your tRPC procedure returns the correct structure directly.
	const data: PaymentRecord[] = rawData as PaymentRecord[]
	const session = await getSession()
	const isAdmin = await checkRole(session, 'ADMIN')

	if (!data) {
		// Handle case where data might be null or undefined (though tRPC usually ensures an array)
		return (
			<div className="flex h-screen items-center justify-center text-gray-700">
				No payment data available.
			</div>
		)
	}

	const renderRow = (item: PaymentRecord) => {
		const name = `${item?.patient?.firstName} ${item?.patient?.lastName}`
		const patient = item?.patient

		return (
			<tr
				className="border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50"
				key={`${item?.id}-${patient?.id}`} // Use unique key
			>
				<td># {item?.id}</td>
				<td className="flex items-center gap-4 p-4">
					<ProfileImage
						bgColor={patient?.colorCode ?? '0000'}
						name={name}
						textClassName="text-black"
						url={patient?.img ?? ''} // Use patient.img directly
					/>
					<div>
						<h3 className="uppercase">{name}</h3>
						<span className="text-sm capitalize">{patient?.gender}</span>
					</div>
				</td>
				<td className="hidden md:table-cell">{patient?.phone}</td>
				<td className="hidden md:table-cell">{format(item?.billDate, 'yyyy-MM-dd')}</td>
				<td className="hidden xl:table-cell">{item?.totalAmount?.toFixed(2)}</td>
				<td className="hidden xl:table-cell">{item?.discount?.toFixed(2)}</td>
				<td className="hidden xl:table-cell">
					{(item?.totalAmount - (item?.discount ?? 0)).toFixed(2)}
				</td>
				<td className="hidden xl:table-cell">{(item?.amountPaid ?? 0).toFixed(2)}</td>
				<td className="hidden xl:table-cell">
					<span
						className={cn(
							item?.status === 'UNPAID'
								? 'text-red-600'
								: item?.status === 'PAID'
									? 'text-emerald-600'
									: 'text-gray-600',
						)}
					>
						{item?.status}
					</span>
				</td>

				<td>
					<ViewAction href={`/appointments/${item?.appointmentId}?cat=bills`} />

					{isAdmin && (
						<ActionDialog
							deleteType="payment"
							id={item?.id.toString()}
							type="delete"
						/>
					)}
				</td>
			</tr>
		)
	}

	return (
		<div className="rounded-xl bg-white px-3 py-6 2xl:px-6">
			<div className="flex items-center justify-between">
				<div className="hidden items-center gap-1 lg:flex">
					<ReceiptText
						className="text-gray-500"
						size={20}
					/>
					<p className="font-semibold text-2xl">{totalRecords}</p>
					<span className="text-gray-600 text-sm xl:text-base">total records</span>
				</div>
				<div className="flex w-full items-center justify-between gap-2 lg:w-fit lg:justify-start">
					<SearchInput />
				</div>
			</div>

			<div className="mt-4">
				<Table
					columns={columns}
					data={data}
					renderRow={renderRow}
				/>

				<Pagination
					currentPage={currentPage as number}
					limit={DATA_LIMIT}
					totalPages={totalPages ?? 1}
					totalRecords={totalRecords as number}
				/>
			</div>
		</div>
	)
}

export default BillingPage
