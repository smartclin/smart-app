import { api } from '@/trpc/server'

import { BookAppointment } from './forms/book-appointment'

export const AppointmentContainer = async ({ id }: { id: string }) => {
	const patient = await api.patient.getPatientById(id)
	const { data: doctors } = await api.doctor.getDoctors()

	return (
		<div>
			{patient && doctors && (
				<BookAppointment
					data={patient}
					doctors={doctors}
				/>
			)}
		</div>
	)
}
