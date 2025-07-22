import { z } from 'zod'

import { addVitalSigns, appointmentAction, createNewAppointment } from '@/actions/appointment'
import { AppointmentSchema, VitalSignsSchema } from '@/lib/schema'
import type { AppointmentStatus } from '@/types/helper'
import {
	getAppointmentById,
	getAppointmentWithMedicalRecordsById,
	getPatientAppointments,
} from '@/utils/services/appointment' // adjust path as needed

import { createTRPCRouter, protectedProcedure } from '../init' // or your tRPC init path

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
	reason: z.string(),
})

const AddVitalSignsInputSchema = VitalSignsSchema.extend({
	appointmentId: z.number(),
	doctorId: z.uuid(), // or string if not UUID
})

export const appointmentRouter = createTRPCRouter({
	getAppointmentById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			return await getAppointmentById(input.id)
		}),

	getPatientAppointments: protectedProcedure
		.input(
			z.object({
				page: z.number().int().min(1),
				limit: z.number().int().min(1).optional(),
				search: z.string().optional(),
				id: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			return await getPatientAppointments(input)
		}),

	getAppointmentWithMedicalRecordsById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			return await getAppointmentWithMedicalRecordsById(input.id)
		}),
	createNewAppointment: protectedProcedure
		.input(AppointmentInputSchema)
		.mutation(async ({ input }) => {
			const result = await createNewAppointment(input)
			if (!result.success) throw new Error(result.msg || 'Failed to create appointment')
			return result
		}),

	appointmentAction: protectedProcedure
		.input(AppointmentActionInputSchema)
		.mutation(async ({ input }) => {
			const { id, status, reason = '' } = input
			const result = await appointmentAction(id, status as AppointmentStatus, reason)
			if (!result.success) throw new Error(result.msg || 'Failed to update appointment status')
			return result
		}),

	addVitalSigns: protectedProcedure.input(AddVitalSignsInputSchema).mutation(async ({ input }) => {
		// split input to match addVitalSigns signature
		const { appointmentId, doctorId, ...vitalSignsData } = input
		const result = await addVitalSigns(vitalSignsData, appointmentId, doctorId)
		if (!result.success) throw new Error(result.msg || 'Failed to add vital signs')
		return result
	}),
})
