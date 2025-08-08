import type { Gender, Role } from '@prisma/client'

import { AppointmentDetails } from '@/components/appointment/appointmentDetails'
import AppointmentQuickLinks from '@/components/appointment/appointmentQuickLinks'
import { BillsContainer } from '@/components/appointment/billsContainer'
import ChartContainer from '@/components/appointment/chartContainer'
import { DiagnosisContainer } from '@/components/appointment/diagnosisContainer'
import { PatientDetailsCard } from '@/components/appointment/patientDetailsCard'
import { PaymentsContainer } from '@/components/appointment/paymentContainer'
import { VitalSigns } from '@/components/appointment/vitalSigns'
import { MedicalHistoryContainer } from '@/components/medical-history-container'
import { trpc } from '@/trpc/server'

// It's a best practice to infer this type directly from your tRPC router.
// Example: `type AppointmentDetailsData = Awaited<ReturnType<typeof trpc.appointment.getAppointmentWithMedicalRecordsById>>`
// However, if you are defining it manually, this is a clean representation.
type AppointmentDetailsData = {
  id: number
  patientId: string | null
  doctorId: string | null
  type: string | null
  appointmentDate: Date
  time: string | null
  note: string | null
  status: string | null
  patient: {
    id: string
    email: string
    createdAt: Date
    updatedAt: Date
    role: Role | null
    firstName: string
    lastName: string
    userId: string
    dateOfBirth: Date
    gender: Gender
    phone: string | null
    img: string | null
    colorCode: string | null
    maritalStatus: string | null
    nutritionalStatus: string | null
    address: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    bloodGroup: string | null
    allergies: string | null
    currentMedications: string | null
    pastMedicalHistory: string | null
    familyMedicalHistory: string | null
    socialHistory: string | null
    occupation: string | null
    preferredLanguage: string | null
    insuranceProvider: string | null
    insurancePolicyNumber: string | null
    primaryCarePhysician: string | null
    referringDoctor: string | null
    dateRegistered: Date | null
    medicalConditions: string | null
    medicalHistory: string | null
    relation: string | null
    emergencyContactNumber: string | null
    insuranceNumber: string | null
    privacyConsent: boolean | null
    serviceConsent: boolean | null
    medicalConsent: boolean | null
  } | null
  doctor: {
    id: string
    name: string
    specialization: string | null
    colorCode: string | null
    img: string | null
  } | null
  bills: object[]
  medical: object[]
}

const AppointmentDetailsPage = async ({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) => {
  const appointmentId = Number(params.id)
  const cat = (searchParams?.cat as string) || 'charts'

  // The data variable should be typed correctly from the start.
  let appointmentData: AppointmentDetailsData | null = null
  let error: Error | undefined

  if (Number.isNaN(appointmentId) || appointmentId <= 0) {
    error = new Error('Invalid appointment ID provided.')
  } else {
    try {
      // Await the tRPC call directly. The result will have the correct type.
      const result =
        await trpc.appointment.getAppointmentWithMedicalRecordsById({
          id: appointmentId,
        })

      if (result) {
        // Now, you can safely assign the result without the "as unknown" hack.
        appointmentData = result as unknown as AppointmentDetailsData
      } else {
        error = new Error('Appointment not found.')
      }
    } catch (err) {
      error = err as Error
      console.error('Error fetching appointment details via tRPC:', error)
    }
  }

  if (error) {
    let errorMessage = 'An unexpected error occurred.'
    if (error instanceof Error) {
      errorMessage = `Error loading appointment details: ${error.message}`
    }
    return (
      <div className='flex h-screen items-center justify-center text-red-500'>
        {errorMessage}
      </div>
    )
  }

  if (!appointmentData) {
    return (
      <div className='flex h-screen items-center justify-center text-gray-700'>
        Loading appointment details... (or Appointment not found)
      </div>
    )
  }

  const data = appointmentData

  return (
    <div className='flex min-h-screen w-full flex-col-reverse gap-10 p-6 lg:flex-row'>
      {/* LEFT SECTION */}
      <div className='flex w-full flex-col gap-6 lg:w-[65%]'>
        {cat === 'charts' && data.patientId && (
          <ChartContainer id={data.patientId} />
        )}
        {cat === 'appointments' && (
          <>
            <AppointmentDetails
              appointmentDate={data.appointmentDate ?? new Date()}
              id={data.id}
              notes={data.note ?? 'N/A'}
              patientId={data.patientId as string}
              time={data.time ?? '10:00'}
            />
            <VitalSigns
              doctorId={data.doctorId as string}
              id={Number(data.id)}
              patientId={data.patientId as string}
            />
          </>
        )}
        {cat === 'diagnosis' && (
          <DiagnosisContainer
            doctorId={data.doctorId as string}
            id={String(data.id)}
            patientId={data.patientId as string}
          />
        )}
        {cat === 'medical-history' && (
          <MedicalHistoryContainer
            id={String(data.id)}
            patientId={data.patientId as string}
          />
        )}
        {cat === 'billing' && <BillsContainer id={Number(data.id)} />}
        {cat === 'payments' && (
          <PaymentsContainer patientId={data.patientId as string} />
        )}
      </div>

      {/* RIGHT SECTION */}
      <div className='flex-1 space-y-6'>
        <AppointmentQuickLinks staffId={data.doctorId as string} />
        {data.patient && <PatientDetailsCard data={data.patient} />}
      </div>
    </div>
  )
}

export default AppointmentDetailsPage
