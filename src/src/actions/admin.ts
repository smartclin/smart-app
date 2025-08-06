'use server'

import z, { treeifyError } from 'zod'

import db from '@/db'
import { auth, getSession } from '@/lib/auth'
import { DoctorSchema, ServicesSchema, StaffSchema, workingDaySchema } from '@/lib/schema'
import type { ServiceInput, StaffInput } from '@/types/data-types'
import { generateRandomColor } from '@/utils'
import { checkRole } from '@/utils/roles'

export async function createNewStaff(data: StaffInput) {
	try {
		const session = await getSession()
		const userId = session?.user?.id

		if (!userId || !(await checkRole(session, 'ADMIN'))) {
			return { success: false, msg: 'Unauthorized' }
		}

		const result = StaffSchema.safeParse(data)
		if (!result.success) {
			return { success: false, errors: true, message: 'Please provide all required info' }
		}

		const { password, ...rest } = result.data

		const user = await auth.api.createUser({
			body: {
				email: rest.email,
				password: password ?? '',
				name: rest.name,
				role: 'doctor',
			},
		})

		await db.staff.create({
			data: {
				...rest,
				userId: user.user.id,
				name: user.user.name,
				id: user.user.id,
				colorCode: generateRandomColor(),
				status: 'ACTIVE',
				phone: rest.phone ?? '',
				licenseNumber: rest.licenseNumber ?? '',
				department: rest.department ?? '',
				img: rest.img ?? '',
			},
		})

		return { success: true, message: 'Doctor added successfully', error: false }
	} catch (error) {
		console.error(error)
		return { error: true, success: false, message: 'Something went wrong' }
	}
}
// Extend DoctorSchema to add password field
const DoctorAuthSchema = DoctorSchema.extend({
	password: z.string().min(6, 'Password should be at least 6 characters long'),
})

// Resulting input type
export type DoctorAuthInput = z.infer<typeof DoctorAuthSchema>

export async function createNewDoctor(
	data: z.infer<typeof DoctorAuthSchema> & {
		workSchedule: z.infer<typeof workingDaySchema>[]
	},
) {
	try {
		const doctorResult = DoctorAuthSchema.safeParse(data)
		const workScheduleResult = z.array(workingDaySchema).safeParse(data.workSchedule)

		if (!doctorResult.success || !workScheduleResult.success) {
			return {
				success: false,
				errors: {
					doctor: doctorResult.success ? undefined : treeifyError(doctorResult.error),
					workSchedule: workScheduleResult.success
						? undefined
						: treeifyError(workScheduleResult.error),
				},
				message: 'Please provide valid and complete doctor and schedule data',
			}
		}

		// Destructure validated data
		const { password, name, ...doctorData } = doctorResult.data
		const workSchedule = workScheduleResult.data

		// Create user account
		const user = await auth.api.createUser({
			body: {
				email: doctorData.email,
				password,
				name,
				role: 'doctor',
			},
		})

		// Create doctor record linked to user ID
		const doctor = await db.doctor.create({
			data: {
				...doctorData,
				id: user.user.id,
				userId: user.user.id,
				name,
			},
		})

		// Create work schedule entries if provided
		if (Array.isArray(workSchedule) && workSchedule.length > 0) {
			await Promise.all(
				workSchedule.map(ws =>
					db.workingDays.create({
						data: {
							day: ws.day,
							startTime: ws.startTime,
							closeTime: ws.closeTime,
							doctorId: doctor.id,
						},
					}),
				),
			)
		}

		return {
			success: true,
			message: 'Doctor added successfully',
			error: false,
		}
	} catch (error) {
		console.error(error)
		return { success: false, error: true, message: 'Something went wrong' }
	}
}

export async function addNewService(data: ServiceInput) {
	try {
		const result = ServicesSchema.safeParse(data)
		if (!result.success) {
			return { success: false, msg: 'Invalid data' }
		}

		const { price, ...rest } = result.data

		await db.services.create({
			data: { ...rest, price: Number(price) },
		})

		return { success: true, error: false, msg: 'Service added successfully' }
	} catch (error) {
		console.error(error)
		return { success: false, msg: 'Internal Server Error' }
	}
}
