import { and, between, desc, eq, gte, like, lte, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { appointment } from "../../db/schema";
import { protectedProcedure } from "../init";
import { AppointmentsCreateSchema, AppointmentsUpdateSchema } from "../schema";

// Create appointment
export const createAppointment = protectedProcedure
	.input(AppointmentsCreateSchema)
	.output(AppointmentsUpdateSchema)
	.handler(async ({ input, context }) => {
		// Check for conflicts
		const existing = await db.query.appointment.findFirst({
			where: and(
				eq(appointment.doctorId, input.doctorId),
				eq(appointment.appointmentDate, input.appointmentDate),
				eq(appointment.status, "PENDING")
			)
		});

		if (existing) {
			throw new Error("Doctor is already booked at this time");
		}
		if (!context.clinicId) {
			throw new Error("Missing clinicId in context");
		}

		const { clinicId, ...appointmentInput } = input;
		const [newAppointment] = await db
			.insert(appointment)
			.values({
				...appointmentInput,
				clinicId: context.clinicId,
				id: crypto.randomUUID()
			})
			.returning();
		return newAppointment;
	});

export const getAppointments = protectedProcedure
	.input(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(10),
			status: z.string().optional(),
			doctorId: z.string(),
			patientId: z.string().optional()
		})
	)
	.handler(async ({ input, context }) => {
		const { page, limit, status, doctorId, patientId } = input;
		const offset = (page - 1) * limit;

		const whereClause = and(
			eq(appointment.clinicId, context.clinicId),
			eq(appointment.isDeleted, false),
			status ? eq(appointment.status, status) : undefined,
			doctorId ? eq(appointment.doctorId, doctorId) : undefined,
			patientId ? eq(appointment.patientId, patientId) : undefined
		);

		const items = await db.query.appointment.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: desc(appointment.appointmentDate),
			with: { patient: true, doctor: true }
		});

		return { items, total: await db.$count(appointment, whereClause) };
	});

// Get appointments by date range
export const getAppointmentsByDateRange = protectedProcedure
	.input(
		z.object({
			startDate: z.date(),
			endDate: z.date(),
			doctorId: z.string().optional(),
			status: z.string().optional()
		})
	)
	.output(z.array(AppointmentsUpdateSchema))
	.handler(async ({ input, context }) => {
		let whereClause = and(
			eq(appointment.clinicId, context.clinicId),
			between(appointment.appointmentDate, input.startDate, input.endDate),
			eq(appointment.isDeleted, false)
		);

		if (input.doctorId) {
			whereClause = and(whereClause, eq(appointment.doctorId, input.doctorId));
		}

		if (input.status) {
			whereClause = and(whereClause, eq(appointment.status, input.status));
		}

		return await db.query.appointment.findMany({
			where: whereClause,
			with: {
				patient: true,
				doctor: true
			},
			orderBy: desc(appointment.appointmentDate)
		});
	});

export const updateAppointmentStatus = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
		})
	)
	.output(AppointmentsUpdateSchema)
	.handler(async ({ input, context }) => {
		const [updated] = await db
			.update(appointment)
			.set({ status: input.status })
			.where(and(eq(appointment.id, input.id), eq(appointment.clinicId, context.clinicId)))
			.returning();
		return updated;
	});

export const listAppointments = protectedProcedure
	.input(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(20),
			offset: z.number().optional(),
			search: z.string().optional(),
			status: z.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
			fromDate: z.date(), // ISO strings
			toDate: z.date(),
			patientId: z.string().optional(),
			doctorId: z.string().optional(),
			doctorSpecialty: z.string().optional(),
			type: z.string().optional()
		})
	)
	.output(
		z.object({
			appointments: z.array(z.any()),
			total: z.number(),
			page: z.number(),
			limit: z.number(),
			totalPages: z.number()
		})
	)
	.handler(async ({ input, context }) => {
		const {
			page,
			limit,
			offset: manualOffset,
			search,
			status,
			fromDate,
			toDate,
			patientId,
			doctorId,
			doctorSpecialty,
			type
		} = input;

		const offset = manualOffset ?? (page - 1) * limit;

		let whereClause = and(eq(appointment.clinicId, context.clinicId), eq(appointment.isDeleted, false));

		if (status) whereClause = and(whereClause, eq(appointment.status, status));
		if (type) whereClause = and(whereClause, eq(appointment.type, type));
		if (doctorSpecialty) whereClause = and(whereClause, eq(appointment.doctorSpecialty, doctorSpecialty));
		if (patientId) whereClause = and(whereClause, eq(appointment.patientId, patientId));
		if (doctorId) whereClause = and(whereClause, eq(appointment.doctorId, doctorId));

		// Date Range Filtering
		if (fromDate) whereClause = and(whereClause, gte(appointment.appointmentDate, new Date(fromDate)));
		if (toDate) whereClause = and(whereClause, lte(appointment.appointmentDate, new Date(toDate)));

		if (search) {
			whereClause = and(
				whereClause,
				or(like(appointment.reason, `%${search}%`), like(appointment.type, `%${search}%`))
			);
		}

		const items = await db.query.appointment.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: desc(appointment.appointmentDate),
			with: { patient: true, doctor: true }
		});

		const total = await db.$count(appointment, whereClause);

		return {
			appointments: items,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	});

// Get appointment by ID
export const getAppointmentById = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.any())
	.handler(async ({ input, context }) => {
		const result = await db.query.appointment.findFirst({
			where: and(
				eq(appointment.id, input.id),
				eq(appointment.clinicId, context.clinicId),
				eq(appointment.isDeleted, false)
			),
			with: { patient: true, doctor: true }
		});

		if (!result) {
			throw new Error("Appointment not found");
		}

		return result;
	});

// Cancel appointment
export const cancelAppointment = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			reason: z.string().optional()
		})
	)
	.output(AppointmentsUpdateSchema)
	.handler(async ({ input, context }) => {
		const [updated] = await db
			.update(appointment)
			.set({
				status: "CANCELLED",
				reason: input.reason ? `Cancelled: ${input.reason}` : appointment.reason
			})
			.where(and(eq(appointment.id, input.id), eq(appointment.clinicId, context.clinicId)))
			.returning();
		return updated;
	});
