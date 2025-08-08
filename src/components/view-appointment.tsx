import type { AppointmentStatus } from '@prisma/client'
import { format } from 'date-fns'
import { Calendar, Phone } from 'lucide-react'

import { getSession } from '@/lib/auth/server'
import { trpc } from '@/trpc/server'
import { calculateAge, formatDateTime } from '@/utils'
import { checkRole } from '@/utils/roles'

import { AppointmentAction } from './appointment-action'
import { AppointmentStatusIndicator } from './appointment-status-indicator'
import { ProfileImage } from './profile-image'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface ViewAppointmentProps {
  id?: number
}
export const ViewAppointment = async ({ id }: ViewAppointmentProps) => {
  if (!id) return null
  const session = await getSession()
  if (!session) return null
  const userId = session?.user.id
  const data = await trpc.appointment.getAppointmentById({ id })
  if (!data) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='flex items-center justify-center rounded-full bg-blue-500/10 px-1.5 py-1 text-blue-600 text-xs hover:underline md:text-sm'
          variant='outline'
        >
          View
        </Button>
      </DialogTrigger>

      <DialogContent className='max-h-[95%] max-w-[425px] overflow-y-auto p-8 md:max-w-2xl 2xl:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Patient Appointment</DialogTitle>
          <DialogDescription>
            This appointment was booked on the{' '}
            {formatDateTime(data?.data?.createdAt?.toString() ?? '')}
          </DialogDescription>
        </DialogHeader>

        {data?.data?.status === 'CANCELLED' && (
          <div className='mt-4 rounded-md bg-yellow-100 p-4'>
            <span className='font-semibold text-sm'>
              This appointment has been cancelled
            </span>
            <p className='text-sm'>
              <strong>Reason</strong>: {data?.data?.reason}
            </p>
          </div>
        )}

        <div className='grid gap-4 py-4'>
          <p className='w-fit rounded bg-blue-100 py-1 text-blue-600 text-xs md:text-sm'>
            Personal Information
          </p>

          <div className='mb-16 flex flex-col gap-6 md:flex-row'>
            <div className='flex w-full gap-1 md:w-1/2'>
              <ProfileImage
                className='size-20 bg-blue-500'
                name={`${data?.data?.patient?.firstName} ${data?.data?.patient?.lastName}`}
                textClassName='text-2xl'
                url={data?.data?.patient?.img ?? ''}
              />

              <div className='space-y-0.5'>
                <h2 className='font-semibold text-lg uppercase md:text-xl'>
                  {`${data?.data?.patient?.firstName} ${data?.data?.patient?.lastName}`}
                </h2>

                <p className='flex items-center gap-2 text-gray-600'>
                  <Calendar
                    className='text-gray-500'
                    size={20}
                  />
                  {calculateAge(data?.data?.patient?.dateOfBirth ?? new Date())}
                </p>

                <span className='flex items-center gap-2 text-sm'>
                  <Phone
                    className='text-gray-500'
                    size={16}
                  />
                  {data?.data?.patient?.phone}
                </span>
              </div>
            </div>

            <div>
              <span className='text-gray-500 text-sm'>Address</span>
              <p className='text-gray-600 capitalize'>
                {data?.data?.patient?.address}
              </p>
            </div>
          </div>

          <p className='w-fit rounded bg-blue-100 py-1 text-blue-600 text-xs md:text-sm'>
            Appointment Information
          </p>

          <div className='grid grid-cols-3 gap-10'>
            <div>
              <span className='text-gray-500 text-sm'>Date</span>
              <p className='text-gray-600 text-sm'>
                {data?.data?.appointmentDate
                  ? format(data.data.appointmentDate, 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className='text-gray-500 text-sm'>Time</span>
              <p className='text-gray-600 text-sm'>
                {data?.data?.time ? format(data.data.time, 'hh:mm a') : 'N/A'}
              </p>
            </div>
            <div>
              <span className='text-gray-500 text-sm'>Status</span>
              <AppointmentStatusIndicator
                status={data?.data?.status as AppointmentStatus}
              />
            </div>
          </div>

          {data?.data?.note && (
            <div>
              <span className='text-gray-500 text-sm'>Note from Patient</span>
              <p>{data?.data?.note}</p>
            </div>
          )}

          <p className='mt-16 w-fit rounded bg-blue-100 px-2 py-1 text-blue-600 text-xs md:text-sm'>
            Physician Information
          </p>
          <div className='mb-8 flex w-full flex-col gap-8 md:flex-row'>
            <div className='flex gap-3'>
              <ProfileImage
                className='bg-emerald-600 xl:size-20'
                name={data?.data?.doctor?.name ?? ''}
                textClassName='xl:text-2xl'
                url={data?.data?.doctor?.img ?? ''}
              />
              <div className=''>
                <h2 className='font-medium text-lg uppercase'>
                  {data?.data?.doctor?.name}
                </h2>
                <p className='flex items-center gap-2 text-gray-600 capitalize'>
                  {data?.data?.doctor?.specialization}
                </p>
              </div>
            </div>
          </div>

          {(await checkRole(session, 'ADMIN')) ||
          data?.data?.doctorId === userId ? (
            <>
              <p className='mt-4 w-fit rounded bg-blue-100 px-2 py-1 text-blue-600 text-xs md:text-sm'>
                Perform Action
              </p>
              <AppointmentAction
                id={data.data?.id ?? 1}
                status={data?.data?.status ?? 'PENDING'}
              />
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
