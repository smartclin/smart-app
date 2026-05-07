// routers/clinic.router.ts
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { appointment, clinicMembers, clinicSetting, clinics, doctor, patient, user, vitalSign } from "../../db/schema";
import { adminProcedure } from "../init";

// Create clinic (admin only)
export const createClinic = adminProcedure
	.input(
		z.object({
			name: z.string(),
			email: z.email().optional(),
			timezone: z.string().default("UTC"),
			address: z.string().optional(),
			phone: z.string().optional()
		})
	)
	.output(z.any())
	.handler(async ({ input }) => {
		const [newClinic] = await db
			.insert(clinics)
			.values({
				id: crypto.randomUUID(),
				...input
			})
			.returning();

		// Create default clinic settings
		await db.insert(clinicSetting).values({
			id: crypto.randomUUID(),
			clinicId: newClinic.id,
			openingTime: "09:00",
			closingTime: "17:00",
			workingDays: JSON.stringify(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"])
		});

		return newClinic;
	});

// Add member to clinic
export const addClinicMember = adminProcedure
	.input(
		z.object({
			clinicId: z.string(),
			userId: z.string(),
			role: z.enum(["ADMIN", "DOCTOR", "STAFF"])
		})
	)
	.output(z.any())
	.handler(async ({ input }) => {
		const [member] = await db
			.insert(clinicMembers)
			.values({
				userId: input.userId,
				clinicId: input.clinicId,
				role: input.role
			})
			.returning();

		// Update user's clinicId
		await db.update(user).set({ clinicId: input.clinicId }).where(eq(user.id, input.userId));

		return member;
	});

export const getVitalSignsHistory = adminProcedure
	.input(
		z.object({
			patientId: z.string(),
			startDate: z.date().optional(),
			endDate: z.date().optional()
		})
	)
	.output(z.array(z.any()))
	.handler(async ({ input }) => {
		const conditions = [eq(vitalSign.patientId, input.patientId)];
		if (input.startDate) {
			conditions.push(sql`${vitalSign.createdAt} >= ${input.startDate.toISOString()}`);
		}
		if (input.endDate) {
			conditions.push(sql`${vitalSign.createdAt} <= ${input.endDate.toISOString()}`);
		}
		const results = await db
			.select()
			.from(vitalSign)
			.where(and(...conditions))
			.orderBy(sql`${vitalSign.createdAt} DESC`);
		return results;
	});

// Get clinic dashboard stats
export const getClinicStats = adminProcedure
	.input(z.object({ clinicId: z.string() }))
	.output(
		z.object({
			totalPatients: z.number(),
			totalDoctors: z.number(),
			totalAppointments: z.number(),
			pendingAppointments: z.number(),
			completedAppointments: z.number(),
			revenue: z.number().optional()
		})
	)
	.handler(async ({ input, context }) => {
		// Check if user has access to this clinic
		const member = await db.query.clinicMembers.findFirst({
			where: and(eq(clinicMembers.clinicId, input.clinicId), eq(clinicMembers.userId, context.user?.id ?? ""))
		});

		if (!member && context.user?.role !== "admin") {
			throw new Error("Access denied");
		}

		const stats = await db.transaction(async tx => {
			const totalPatients = await tx.$count(
				patient,
				and(eq(patient.clinicId, input.clinicId), eq(patient.isDeleted, false))
			);

			const totalDoctors = await tx.$count(
				doctor,
				and(eq(doctor.clinicId, input.clinicId), eq(doctor.isDeleted, false))
			);

			const totalAppointments = await tx.$count(appointment, eq(appointment.clinicId, input.clinicId));

			const pendingAppointments = await tx.$count(
				appointment,
				and(eq(appointment.clinicId, input.clinicId), eq(appointment.status, "PENDING"))
			);

			const completedAppointments = await tx.$count(
				appointment,
				and(eq(appointment.clinicId, input.clinicId), eq(appointment.status, "COMPLETED"))
			);

			return {
				totalPatients,
				totalDoctors,
				totalAppointments,
				pendingAppointments,
				completedAppointments
			};
		});

		return stats;
	});
