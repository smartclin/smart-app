'use server'

import type { AppointmentStatus } from 'prisma'

import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { AppointmentSchema, VitalSignsSchema } from '@/lib/schema'
import type { AppointmentInput, VitalSignsInput } from '@/types/data-types'

const AppointmentInputSchema = AppointmentSchema

const AppointmentIdSchema = z.number()

const AppointmentStatusSchema = z.enum([
	'PENDING',
	'CONFIRMED',
	'CANCELLED',
	'COMPLETED',
	// add all valid enum values of AppointmentStatus here
])

const AppointmentActionInputSchema = z.object({
	id: z.union([z.string(), z.number()]),
	status: AppointmentStatusSchema,
	reason: z.string().optional().nullable(),
})

const AddVitalSignsInputSchema = VitalSignsSchema.extend({
	appointmentId: z.number(),
	doctorId: z.string().uuid(), // or string if not UUID
})

export async function createNewAppointment(data: AppointmentInput) {
	try {
		const validatedData = AppointmentSchema.safeParse(data)

		if (!validatedData.success) {
			return { success: false, msg: 'Invalid data' }
		}
		const validated = validatedData.data

		await db.appointment.create({
			data: {
				// FIX: patientId should come from 'validated' data
				patientId: validated.patientId, // <--- CORRECTED LINE
				doctorId: validated.doctorId,
				time: validated.time,
				type: validated.type,
				appointmentDate: new Date(validated.appointmentDate),
				note: validated.note,
			},
		})

		return {
			success: true,
			message: 'Appointment booked successfully',
		}
	} catch (error) {
		console.log(error)
		return { success: false, msg: 'Internal Server Error' }
	}
}
export async function appointmentAction(
	id: string | number,
	status: AppointmentStatus,
	reason: string,
) {
	try {
		await db.appointment.update({
			where: { id: Number(id) },
			data: {
				status,
				reason,
			},
		})

		return {
			success: true,
			error: false,
			msg: `Appointment ${status.toLowerCase()} successfully`,
		}
	} catch (error) {
		console.log(error)
		return { success: false, msg: 'Internal Server Error' }
	}
}

export async function addVitalSigns(
	data: VitalSignsInput,
	appointmentId: number,
	doctorId: string,
) {
	try {
		const session = await getSession()
		const userId = session?.user.id
		if (!userId) {
			return { success: false, msg: 'Unauthorized' }
		}

		const validatedData = VitalSignsSchema.parse(data)

		let medicalRecord = null

		if (!validatedData.medicalId) {
			medicalRecord = await db.medicalRecords.create({
				data: {
					patientId: validatedData.patientId,
					appointmentId: appointmentId,
					doctorId: doctorId,
				},
			})
		}

		const medId = validatedData.medicalId || medicalRecord?.id

		await db.vitalSigns.create({
			data: {
				...validatedData,
				medicalId: medId ?? 0,
			},
		})

		return {
			success: true,
			msg: 'Vital signs added successfully',
		}
	} catch (error) {
		console.log(error)
		return { success: false, msg: 'Internal Server Error' }
	}
}
