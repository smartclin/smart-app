import { endOfMonth, format, getMonth, startOfYear } from 'date-fns'

// --- Utility types and functions from your original file ---
export type AppointmentStatus = 'CANCELLED' | 'COMPLETED' | 'PENDING' | 'SCHEDULED'

interface Appointment {
	appointmentDate: Date // Renamed from appointment_date to match Drizzle schema
	status: AppointmentStatus | null // status can be null
}

function isValidStatus(status: string): status is AppointmentStatus {
	return ['CANCELLED', 'COMPLETED', 'PENDING', 'SCHEDULED'].includes(status)
}

const initializeMonthlyData = () => {
	const this_year = new Date().getFullYear()

	const months = Array.from({ length: getMonth(new Date()) + 1 }, (_, index) => ({
		appointment: 0,
		completed: 0,
		name: format(new Date(this_year, index), 'MMM'),
	}))
	return months
}
export const processAppointments = async (appointments: Appointment[]) => {
	const monthlyData = initializeMonthlyData()

	const appointmentCounts = appointments.reduce<Record<AppointmentStatus, number>>(
		(acc, appointment) => {
			const status = appointment.status
			const appointmentDate = appointment.appointmentDate

			const monthIndex = getMonth(appointmentDate)

			if (
				appointmentDate >= startOfYear(new Date()) &&
				appointmentDate <= endOfMonth(new Date()) &&
				monthlyData[monthIndex] // <--- Problematic check
			) {
				monthlyData[monthIndex].appointment += 1 // Line 46
				// ...
				if (status === 'COMPLETED') {
					monthlyData[monthIndex].completed += 1 // Line 49
				}
			}
			// FIX: Safely check status for validity and then update counts
			if (status && isValidStatus(status)) {
				// Check if status is not null, then validate
				acc[status] = (acc[status] || 0) + 1
			}

			return acc
		},
		{
			CANCELLED: 0,
			COMPLETED: 0,
			PENDING: 0,
			SCHEDULED: 0,
		},
	)

	return { appointmentCounts, monthlyData }
}

export interface AllAppointmentsProps {
	page: number | string
	limit?: number | string
	search?: string
	id?: string
}
