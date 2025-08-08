import { trpc } from '@/trpc/server';

import { BookAppointment } from './forms/book-appointment';

export const AppointmentContainer = async ({ id }: { id: string }) => {
  const patient = await trpc.patient.getPatientById(id);
  const { data: doctors } = await trpc.doctor.getDoctors();

  return (
    <div>
      {patient && doctors && (
        <BookAppointment
          data={patient}
          doctors={doctors}
        />
      )}
    </div>
  );
};
