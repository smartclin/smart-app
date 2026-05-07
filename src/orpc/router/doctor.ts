// orpc/router/doctor.ts
import { and, desc, eq, like, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "#/db";
import { doctor, user, workingDays } from "#/db/schema";

import { protectedProcedure } from "../init";
import { DoctorSchema, DoctorsCreateSchema, DoctorsUpdateSchema } from "../schema";

// Schemas
// const DoctorSchema = z.object({
// 	id: z.string(),
// 	email: z.string().nullable(),
// 	name: z.string(),
// 	userId: z.string().nullable(),
// 	clinicId: z.string().nullable(),
// 	specialty: z.string(),
// 	licenseNumber: z.string().nullable(),
// 	phone: z.string().nullable(),
// 	address: z.string().nullable(),
// 	department: z.string().nullable(),
// 	img: z.string().nullable(),
// 	colorCode: z.string().nullable(),
// 	availabilityStatus: z.string().nullable(),
// 	availableFromWeekDay: z.number().nullable(),
// 	availableToWeekDay: z.number().nullable(),
// 	isActive: z.boolean().nullable(),
// 	status: z.string().nullable(),
// 	availableFromTime: z.string().nullable(),
// 	availableToTime: z.string().nullable(),
// 	type: z.string().nullable(),
// 	appointmentPrice: z.number().nullable(),
// 	role: z.string().nullable(),
// 	rating: z.number().nullable(),
// 	deletedAt: z.date().nullable(),
// 	isDeleted: z.boolean().nullable(),
// 	createdAt: z.date(),
// 	updatedAt: z.date()
// });

// const CreateDoctorSchema = z.object({
// 	email: z.string().email().optional(),
// 	name: z.string().min(1),
// 	userId: z.string().optional(),
// 	specialty: z.string().min(1),
// 	licenseNumber: z.string().optional(),
// 	phone: z.string().optional(),
// 	address: z.string().optional(),
// 	department: z.string().optional(),
// 	img: z.string().optional(),
// 	colorCode: z.string().optional(),
// 	availabilityStatus: z.enum(["Available", "Busy", "On Leave", "Off Duty"]).optional(),
// 	availableFromWeekDay: z.number().min(1).max(7).optional(),
// 	availableToWeekDay: z.number().min(1).max(7).optional(),
// 	availableFromTime: z
// 		.string()
// 		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
// 		.optional(),
// 	availableToTime: z
// 		.string()
// 		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
// 		.optional(),
// 	type: z.enum(["FULL", "PART", "CONTRACT"]).default("FULL"),
// 	appointmentPrice: z.number().min(0).optional(),
// 	status: z.enum(["ACTIVE", "INACTIVE", "DORMANT"]).default("ACTIVE"),
// 	isActive: z.boolean().default(true)
// });

// const UpdateDoctorSchema = CreateDoctorSchema.partial();

const WorkingDaySchema = z.object({
	id: z.string(),
	doctorId: z.string(),
	day: z.string(),
	startTime: z.string(),
	endTime: z.string(),
	createdAt: z.date(),
	updatedAt: z.date()
});

const DoctorWithScheduleSchema = DoctorSchema.extend({
	workingDays: z.array(WorkingDaySchema),
	user: z
		.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
			image: z.string().nullable()
		})
		.nullable(),
	clinic: z
		.object({
			id: z.string(),
			name: z.string()
		})
		.nullable()
});

// Procedures

// Create doctor
export const createDoctor = protectedProcedure
	.input(DoctorsCreateSchema)
	.output(DoctorSchema)
	.handler(async ({ input, context }) => {
		const { headers } = context;

		// Get user from headers (assuming auth middleware sets user)
		const userId = headers.get("x-user-id");
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const userRecord = await db.query.user.findFirst({
			where: eq(user.id, userId)
		});

		if (
			!userRecord ||
			(userRecord.role !== "admin" && userRecord.role !== "superadmin" && userRecord.role !== "staff")
		) {
			throw new Error("Forbidden: Only admin/staff can create doctors");
		}

		let clinicId = input.clinicId;
		if (!clinicId && userRecord.clinicId) {
			clinicId = userRecord.clinicId;
		}

		const [newDoctor] = await db
			.insert(doctor)
			.values({
				...input,
				clinicId: clinicId || null,
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return newDoctor;
	});

// Get doctor by ID
export const getDoctor = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(DoctorWithScheduleSchema.nullable())
	.handler(async ({ input }) => {
		const doctorData = await db.query.doctor.findFirst({
			where: and(eq(doctor.id, input.id), eq(doctor.isDeleted, false)),
			with: {
				workingDays: true,
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true
					}
				},
				clinic: {
					columns: {
						id: true,
						name: true
					}
				}
			}
		});

		return doctorData ?? null;
	});

// Update doctor
export const updateDoctor = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			data: DoctorsUpdateSchema
		})
	)
	.output(DoctorSchema)
	.handler(async ({ input }) => {
		const [updatedDoctor] = await db
			.update(doctor)
			.set({
				...input.data,
				updatedAt: new Date()
			})
			.where(and(eq(doctor.id, input.id), eq(doctor.isDeleted, false)))
			.returning();

		if (!updatedDoctor) {
			throw new Error("Doctor not found");
		}

		return updatedDoctor;
	});

// Delete doctor (soft delete)
export const deleteDoctor = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.object({ success: z.boolean(), id: z.string() }))
	.handler(async ({ input }) => {
		const [deletedDoctor] = await db
			.update(doctor)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(doctor.id, input.id))
			.returning({ id: doctor.id });

		if (!deletedDoctor) {
			throw new Error("Doctor not found");
		}

		return { success: true, id: deletedDoctor.id };
	});

// Permanent delete doctor
export const permanentlyDeleteDoctor = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input }) => {
		// Delete working days first
		await db.delete(workingDays).where(eq(workingDays.doctorId, input.id));

		// Delete doctor
		await db.delete(doctor).where(eq(doctor.id, input.id));

		return { success: true };
	});

// Get available doctors for a specific date
export const getAvailableDoctors = protectedProcedure
	.input(
		z.object({
			date: z.date(),
			specialty: z.string().optional(),
			clinicId: z.string().optional()
		})
	)
	.output(z.array(DoctorWithScheduleSchema))
	.handler(async ({ input }) => {
		const dayOfWeek = input.date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

		let whereClause = and(eq(doctor.isActive, true), eq(doctor.isDeleted, false), eq(doctor.status, "ACTIVE"));

		if (input.clinicId) {
			whereClause = and(whereClause, eq(doctor.clinicId, input.clinicId));
		}

		if (input.specialty) {
			whereClause = and(whereClause, eq(doctor.specialty, input.specialty));
		}

		const doctorsList = await db.query.doctor.findMany({
			where: whereClause,
			with: {
				workingDays: {
					where: eq(workingDays.day, dayOfWeek)
				},
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true
					}
				},
				clinic: {
					columns: {
						id: true,
						name: true
					}
				}
			}
		});

		return doctorsList.filter(d => d.workingDays.length > 0);
	});

// Get doctor schedule (working days)
export const getDoctorSchedule = protectedProcedure
	.input(z.object({ doctorId: z.string(), date: z.date().optional() }))
	.output(z.array(WorkingDaySchema))
	.handler(async ({ input }) => {
		const schedule = await db.query.workingDays.findMany({
			where: eq(workingDays.doctorId, input.doctorId),
			orderBy: workingDays.day
		});

		return schedule;
	});

// Add working day to doctor schedule
export const addWorkingDay = protectedProcedure
	.input(
		z.object({
			doctorId: z.string(),
			day: z.string(),
			startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
			endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		})
	)
	.output(WorkingDaySchema)
	.handler(async ({ input }) => {
		// Check if working day already exists for this doctor and day
		const existing = await db.query.workingDays.findFirst({
			where: and(eq(workingDays.doctorId, input.doctorId), eq(workingDays.day, input.day))
		});

		if (existing) {
			// Update existing
			const [updated] = await db
				.update(workingDays)
				.set({
					startTime: input.startTime,
					endTime: input.endTime,
					updatedAt: new Date()
				})
				.where(eq(workingDays.id, existing.id))
				.returning();
			return updated;
		}

		// Create new
		const [newWorkingDay] = await db
			.insert(workingDays)
			.values({
				id: crypto.randomUUID(),
				doctorId: input.doctorId,
				day: input.day,
				startTime: input.startTime,
				endTime: input.endTime,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return newWorkingDay;
	});

// Remove working day
export const removeWorkingDay = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input }) => {
		await db.delete(workingDays).where(eq(workingDays.id, input.id));
		return { success: true };
	});

// List doctors with pagination and filters
export const listDoctors = protectedProcedure
	.input(
		z.object({
			page: z.number().min(1).default(1),
			limit: z.number().min(1).max(100).default(10),
			offset: z.number().optional(),

			search: z.string().optional(),
			status: z.string().optional(),
			isActive: z.boolean().optional(),
			specialty: z.string().optional(),
			clinicId: z.string().optional(),
			sortBy: z.enum(["name", "createdAt", "rating", "specialty"]).default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc")
		})
	)
	.output(
		z.object({
			doctors: z.array(DoctorWithScheduleSchema),
			total: z.number(),
			page: z.number(),
			limit: z.number(),
			totalPages: z.number()
		})
	)
	.handler(async ({ input }) => {
		const { page, limit, search, status, isActive, specialty, clinicId, sortBy, sortOrder } = input;
		const offset = (page - 1) * limit;

		let whereClause = and(eq(doctor.isDeleted, false));

		if (clinicId) {
			whereClause = and(whereClause, eq(doctor.clinicId, clinicId));
		}

		if (search) {
			whereClause = and(
				whereClause,
				or(
					like(doctor.name, `%${search}%`),
					like(doctor.specialty, `%${search}%`),
					like(doctor.phone, `%${search}%`),
					like(doctor.email, `%${search}%`),
					like(doctor.department, `%${search}%`)
				)
			);
		}

		if (status) {
			whereClause = and(whereClause, eq(doctor.status, status));
		}

		if (isActive !== undefined) {
			whereClause = and(whereClause, eq(doctor.isActive, isActive));
		}

		if (specialty) {
			whereClause = and(whereClause, eq(doctor.specialty, specialty));
		}

		const sortColumn =
			sortBy === "name"
				? doctor.name
				: sortBy === "rating"
					? doctor.rating
					: sortBy === "specialty"
						? doctor.specialty
						: doctor.createdAt;

		const orderBy = sortOrder === "asc" ? sortColumn : desc(sortColumn);

		const doctorsList = await db.query.doctor.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy,
			with: {
				workingDays: true,
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true
					}
				},
				clinic: {
					columns: {
						id: true,
						name: true
					}
				}
			}
		});

		const total = await db.$count(doctor, whereClause);

		return {
			doctors: doctorsList,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	});

// Get doctors by specialty
export const getDoctorsBySpecialty = protectedProcedure
	.input(
		z.object({
			specialty: z.string(),
			clinicId: z.string().optional()
		})
	)
	.output(z.array(DoctorSchema))
	.handler(async ({ input }) => {
		let whereClause = and(
			eq(doctor.specialty, input.specialty),
			eq(doctor.isActive, true),
			eq(doctor.isDeleted, false)
		);

		if (input.clinicId) {
			whereClause = and(whereClause, eq(doctor.clinicId, input.clinicId));
		}

		const doctorsList = await db.query.doctor.findMany({
			where: whereClause,
			orderBy: doctor.name
		});

		return doctorsList;
	});

// Get doctor statistics
export const getDoctorStatistics = protectedProcedure
	.input(
		z.object({
			doctorId: z.string(),
			startDate: z.date().optional(),
			endDate: z.date().optional()
		})
	)
	.output(
		z.object({
			totalAppointments: z.number(),
			completedAppointments: z.number(),
			cancelledAppointments: z.number(),
			averageRating: z.number().nullable(),
			totalPatients: z.number(),
			totalRevenue: z.number(),
			upcomingAppointments: z.number()
		})
	)
	.handler(async ({ input }) => {
		const { doctorId, startDate, endDate } = input;

		let appointmentFilter: SQL | undefined;

		if (startDate) {
			appointmentFilter = and(appointmentFilter, sql`appointment_date >= ${startDate}`);
		}

		if (endDate) {
			appointmentFilter = and(appointmentFilter, sql`appointment_date <= ${endDate}`);
		}

		const appointments = await db.query.appointment.findMany({
			where: and(eq(sql`doctor_id`, doctorId), appointmentFilter, eq(sql`is_deleted`, false))
		});

		const totalAppointments = appointments.length;
		const completedAppointments = appointments.filter(a => a.status === "COMPLETED").length;
		const cancelledAppointments = appointments.filter(a => a.status === "CANCELLED").length;

		const upcomingAppointments = appointments.filter(a => {
			const appointmentDate = new Date(a.appointmentDate);
			return appointmentDate > new Date() && (a.status === "SCHEDULED" || a.status === "PENDING");
		}).length;

		const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

		const totalRevenue = appointments
			.filter(a => a.status === "COMPLETED" && a.appointmentPrice)
			.reduce((sum, a) => sum + (a.appointmentPrice || 0), 0);

		const doctorRating = await db.query.doctor.findFirst({
			where: eq(doctor.id, doctorId),
			columns: { rating: true }
		});

		return {
			totalAppointments,
			completedAppointments,
			cancelledAppointments,
			averageRating: doctorRating?.rating || null,
			totalPatients: uniquePatients,
			totalRevenue,
			upcomingAppointments
		};
	});

// Bulk update doctor status
export const bulkUpdateDoctorStatus = protectedProcedure
	.input(
		z.object({
			doctorIds: z.array(z.string()),
			isActive: z.boolean(),
			status: z.enum(["ACTIVE", "INACTIVE", "DORMANT"]).optional()
		})
	)
	.output(z.object({ updatedCount: z.number() }))
	.handler(async ({ input }) => {
		const updateData: Partial<typeof doctor.$inferInsert> = {
			isActive: input.isActive,
			updatedAt: new Date()
		};

		if (input.status) {
			updateData.status = input.status;
		}

		const result = await db
			.update(doctor)
			.set(updateData)
			.where(sql`id IN ${input.doctorIds}`)
			.returning({ id: doctor.id });

		return { updatedCount: result.length };
	});

// Get unique specialties
export const getSpecialties = protectedProcedure
	.input(
		z.object({
			clinicId: z.string().optional()
		})
	)
	.output(z.array(z.string()))
	.handler(async ({ input }) => {
		let whereClause = and(eq(doctor.isDeleted, false));

		if (input.clinicId) {
			whereClause = and(whereClause, eq(doctor.clinicId, input.clinicId));
		}

		const result = await db
			.selectDistinct({ specialty: doctor.specialty })
			.from(doctor)
			.where(whereClause)
			.orderBy(doctor.specialty);

		return result.map(r => r.specialty);
	});
