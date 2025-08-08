import type { AppointmentStatus } from '@prisma/client'
import { format } from 'date-fns'
import { BriefcaseBusiness } from 'lucide-react'

import { AppointmentActionOptions } from '@/components/appointment-actions'
import { AppointmentContainer } from '@/components/appointment-container'
import { AppointmentStatusIndicator } from '@/components/appointment-status-indicator'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { ViewAppointment } from '@/components/view-appointment'
import { getSession } from '@/lib/auth'
import { HydrateClient, trpc } from '@/trpc/server'
import { checkRole, getRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'

type AppointmentItem = {
  id: number
  patientId: string | null
  doctorId: string | null
  type: string | null
  appointmentDate: Date
  time: string | null
  status: AppointmentStatus | null
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    gender: string
    img: string | null
    dateOfBirth: Date | null
    colorCode: string | null
  } | null
  doctor: {
    id: string
    name: string
    specialization: string | null
    colorCode: string | null
    img: string | null
  } | null
}

// 2. Define the type for the complete successful response object
// that your `getPatientAppointments` procedure returns.
type AppointmentsApiSuccess = {
  data: AppointmentItem[] // The array of appointment items
  totalPages: number
  totalRecord: number
  currentPage: number
  // If your API also returns a 'success' boolean or 'message' on success, add them here.
  // Based on your previous procedure, it probably just returns the data and pagination.
  // If it *does* return `success: true` then add `success: true;` here.
}

// --- Columns Definition ---
const columns = [
  { header: 'Info', key: 'name' },
  {
    header: 'Date',
    key: 'appointment_date',
    className: 'hidden md:table-cell',
  },
  { header: 'Time', key: 'time', className: 'hidden md:table-cell' },
  { header: 'Doctor', key: 'doctor', className: 'hidden md:table-cell' },
  { header: 'Status', key: 'status', className: 'hidden xl:table-cell' },
  { header: 'Actions', key: 'action' },
]

// --- getQueryId Helper ---
function getQueryId(
  userRole: string | undefined,
  id: string | undefined,
  userId: string | undefined,
): string | undefined {
  if (userRole === 'ADMIN') return id
  if (userRole === 'DOCTOR' || userRole === 'STAFF') return id ?? userId
  return userRole === 'PATIENT' ? userId : undefined
}
const Appointments = async (props: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const searchParams = props.searchParams
  const session = await getSession()
  const userId = session?.user.id
  const userRole = await getRole()

  const isPatient = await checkRole(session, 'PATIENT')

  // Convert 'page' to number with fallback to 1
  const pageParam = typeof searchParams?.p === 'string' ? searchParams.p : '1'
  const page = Number(pageParam)
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page

  const searchQuery = typeof searchParams?.q === 'string' ? searchParams.q : ''
  const id = typeof searchParams?.id === 'string' ? searchParams.id : undefined

  const queryId = getQueryId(userRole, id, userId)

  // Initialize `appointmentsResponse` to undefined, as it might fail
  let appointmentsResponse: AppointmentsApiSuccess | undefined
  let error: Error | undefined

  try {
    // Pass numeric page
    appointmentsResponse = (await trpc.appointment.getPatientAppointments({
      page: safePage,
      search: searchQuery,
      id: queryId,
      limit: DATA_LIMIT,
    })) as AppointmentsApiSuccess
  } catch (err) {
    error = err as Error
    console.error('Error fetching appointments in page.tsx:', error)
  }

  // --- Error and No Data Handling ---
  if (error) {
    let errorMessage = 'An unexpected error occurred.'
    if (error instanceof Error) {
      errorMessage = `Error loading appointments: ${error.message}`
    }
    return (
      <div className='flex h-screen items-center justify-center text-red-500'>
        {errorMessage}
      </div>
    )
  }

  // If there was no error but no response or data, display a message.
  // This is vital if `appointmentsResponse` could still be `undefined` or lack `data`
  // even without a caught error, though it usually implies a structural problem.
  if (!appointmentsResponse || !appointmentsResponse.data) {
    return (
      <div className='flex h-screen items-center justify-center text-red-500'>
        No appointments data available.
      </div>
    )
  }

  // At this point, `appointmentsResponse` is definitely `AppointmentsApiSuccess`.
  // Destructure properties directly.
  const { data, totalPages, totalRecord, currentPage } = appointmentsResponse

  // --- renderItem function definition ---
  const renderItem = (item: AppointmentItem) => {
    // Use AppointmentItem here
    const patientName = item?.patient
      ? `${item.patient.firstName ?? ''} ${item.patient.lastName ?? ''}`
      : 'N/A'

    return (
      <tr
        className='border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50'
        key={item.id}
      >
        <td className='flex items-center gap-2 py-2 md:gap-4 xl:py-4'>
          {item.patient && (
            <ProfileImage
              bgColor={item.patient.colorCode ?? '0000'}
              name={patientName}
              url={item.patient.img ?? ''}
            />
          )}
          <div>
            <h3 className='font-semibold uppercase'>{patientName}</h3>
            <span className='text-xs capitalize md:text-sm'>
              {item.patient?.gender?.toLowerCase() ?? 'n/a'}
            </span>
          </div>
        </td>

        <td className='hidden md:table-cell'>
          {item.appointmentDate
            ? format(new Date(item.appointmentDate), 'yyyy-MM-dd')
            : 'N/A'}
        </td>
        <td className='hidden md:table-cell'>{item.time ?? 'N/A'}</td>

        <td className='hidden items-center py-2 md:table-cell'>
          <div className='flex items-center gap-2 md:gap-4'>
            {item.doctor && (
              <ProfileImage
                bgColor={item.doctor.colorCode ?? '0000'}
                name={item.doctor.name ?? ''}
                textClassName={'text-black'}
                url={item.doctor.img ?? ''}
              />
            )}
            <div>
              <h3 className='font-semibold uppercase'>
                {item.doctor?.name ?? 'N/A'}
              </h3>
              <span className='text-xs capitalize md:text-sm'>
                {item.doctor?.specialization ?? 'N/A'}
              </span>
            </div>
          </div>
        </td>

        <td className='hidden xl:table-cell'>
          <AppointmentStatusIndicator status={item.status || 'PENDING'} />
        </td>

        <td>
          <div className='flex items-center gap-2'>
            <ViewAppointment id={item.id} />
            <AppointmentActionOptions
              appointmentId={item.id}
              doctorId={item.doctorId ?? 'N/A'}
              patientId={item.patientId ?? 'N/A'}
              status={item.status || 'PENDING'}
              userId={userId ?? 'N/A'}
            />
          </div>
        </td>
      </tr>
    )
  }

  // --- Main Component Return (JSX) ---
  return (
    <HydrateClient>
      <div className='rounded-xl bg-white p-2 md:p-4 2xl:p-6'>
        <div className='flex items-center justify-between'>
          <div className='hidden items-center gap-1 lg:flex'>
            <BriefcaseBusiness
              className='text-gray-500'
              size={20}
            />
            <p className='font-semibold text-2xl'>{totalRecord}</p>
            <span className='text-gray-600 text-sm xl:text-base'>
              total appointments
            </span>
          </div>

          <div className='flex w-full items-center justify-between gap-2 lg:w-fit lg:justify-start'>
            <SearchInput />
            {isPatient && <AppointmentContainer id={userId ?? 'N/A'} />}
          </div>
        </div>

        <div className='mt-6'>
          <Table
            columns={columns}
            data={data}
            renderRow={renderItem}
          />

          {/* Only show pagination if there's data */}
          {data.length > 0 && (
            <Pagination
              currentPage={currentPage}
              limit={DATA_LIMIT}
              totalPages={totalPages}
              totalRecords={totalRecord}
            />
          )}
        </div>
      </div>
    </HydrateClient>
  )
}

export default Appointments
