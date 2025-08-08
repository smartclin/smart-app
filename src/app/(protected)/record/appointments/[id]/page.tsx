import type { Gender, Role } from '@prisma/client';

import { AppointmentDetails } from '@/components/appointment/appointment-details';
import AppointmentQuickLinks from '@/components/appointment/appointment-quick-links';
import { BillsContainer } from '@/components/appointment/bills-container';
import ChartContainer from '@/components/appointment/chart-container';
import { DiagnosisContainer } from '@/components/appointment/diagnosis-container';
import { PatientDetailsCard } from '@/components/appointment/patient-details-card';
import { PaymentsContainer } from '@/components/appointment/payment-container';
import { VitalSigns } from '@/components/appointment/vital-signs';
import { MedicalHistoryContainer } from '@/components/medical-history-container';
import { trpc } from '@/trpc/server';

// `getAppointmentWithMedicalRecordsById` and include all fields expected by PatientDetailsCard.
type AppointmentDetailsData = {
  id: number;
  patientId: string | null;
  doctorId: string | null;
  type: string | null;
  appointmentDate: Date;
  time: string | null;
  note: string | null;
  status: string | null; // Assuming AppointmentStatus is string-based
  patient: {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    role: Role | null;
    firstName: string;
    lastName: string;
    userId: string; // Ensure this matches your Patient/User model structure
    dateOfBirth: Date;
    gender: Gender;
    phone: string | null;
    img: string | null;
    colorCode: string | null;
    maritalStatus: string | null;
    nutritionalStatus: string | null;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null; // Assuming this is the correct field name
    bloodGroup: string | null;
    allergies: string | null;
    currentMedications: string | null;
    pastMedicalHistory: string | null;
    familyMedicalHistory: string | null;
    socialHistory: string | null;
    occupation: string | null;
    preferredLanguage: string | null;
    insuranceProvider: string | null;
    insurancePolicyNumber: string | null;
    primaryCarePhysician: string | null;
    referringDoctor: string | null;
    dateRegistered: Date | null;
    medicalConditions: string | null;
    medicalHistory: string | null;
    relation: string | null;
    // **NEWLY ADDED PROPERTIES based on the error message:**
    emergencyContactNumber: string | null; // Assuming string for phone number
    insuranceNumber: string | null; // Assuming string for insurance policy number
    privacyConsent: boolean; // Assuming boolean for consent flags
    serviceConsent: boolean; // Assuming boolean for consent flags
    medicalConsent: boolean; // Assuming boolean for consent flags
  } | null;
  doctor: {
    id: string;
    name: string;
    specialization: string | null;
    colorCode: string | null;
    img: string | null;
  } | null;
  bills: object[];
  medical: object[];
};
const AppointmentDetailsPage = async ({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const appointmentId = Number(params.id);
  const cat = (searchParams?.cat as string) || 'charts';

  let appointmentData: AppointmentDetailsData | null = null;
  let error: Error | undefined;

  if (Number.isNaN(appointmentId) || appointmentId <= 0) {
    error = new Error('Invalid appointment ID provided.');
  } else {
    try {
      // Pass appointmentId variable correctly here:
      const result = await trpc.appointment.getAppointmentWithMedicalRecordsById({
        id: appointmentId
      });

      if (result) {
        appointmentData = result as unknown as AppointmentDetailsData;
      } else {
        error = new Error('Appointment not found.');
      }
    } catch (err) {
      error = err as Error;
      console.error('Error fetching appointment details via tRPC:', error);
    }
  }

  if (error) {
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = `Error loading appointment details: ${error.message}`;
    }
    return (
      <div className='flex h-screen items-center justify-center text-red-500'>{errorMessage}</div>
    );
  }

  if (!appointmentData) {
    return (
      <div className='flex h-screen items-center justify-center text-gray-700'>
        Loading appointment details... (or Appointment not found)
      </div>
    );
  }

  const data = appointmentData;

  return (
    <div className='flex min-h-screen w-full flex-col-reverse gap-10 p-6 lg:flex-row'>
      {/* LEFT SECTION */}
      <div className='flex w-full flex-col gap-6 lg:w-[65%]'>
        {cat === 'charts' && data.patientId && <ChartContainer id={data.patientId} />}
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
        {cat === 'billing' && <BillsContainer id={Number(data.id)} />}{' '}
        {cat === 'payments' && <PaymentsContainer patientId={data.patientId as string} />}
      </div>

      {/* RIGHT SECTION */}
      <div className='flex-1 space-y-6'>
        <AppointmentQuickLinks staffId={data.doctorId as string} />
        {data.patient && <PatientDetailsCard data={data.patient} />}
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
