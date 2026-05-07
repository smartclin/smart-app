// routes/demo/patient-router.ts

import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "#/db";
import {
	appointment,
	diagnosis,
	growthRecord,
	immunization,
	medicalRecord,
	patient,
	payment,
	prescription,
	vitalSign
} from "#/db/schema";

import { protectedProcedure } from "../init";

// ================ SCHEMAS ================

export const PatientSchema = z.object({
	id: z.string(),
	clinicId: z.string(),
	userId: z.string(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	emergencyContactNumber: z.string().nullable(),
	firstName: z.string(),
	lastName: z.string(),
	dateOfBirth: z.date(),
	gender: z.string().nullable(),
	maritalStatus: z.string().nullable(),
	nutritionalStatus: z.string().nullable(),
	address: z.string().nullable(),
	emergencyContactName: z.string().nullable(),
	relation: z.string().nullable(),
	allergies: z.string().nullable(),
	medicalConditions: z.string().nullable(),
	medicalHistory: z.string().nullable(),
	image: z.string().nullable(),
	colorCode: z.string().nullable(),
	role: z.string().nullable(),
	status: z.string().nullable(),
	isActive: z.boolean().nullable(),
	deletedAt: z.date().nullable(),
	isDeleted: z.boolean().nullable(),
	createdById: z.string().nullable(),
	updatedById: z.string().nullable(),
	bloodGroup: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export const PatientCreateSchema = PatientSchema.omit({
	id: true,
	clinicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	isDeleted: true,
	createdById: true,
	updatedById: true
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

export const PatientWithRelationsSchema = PatientSchema.extend({
	appointments: z.array(z.any()).optional(),
	medicalRecords: z.array(z.any()).optional(),
	encounters: z.array(z.any()).optional(),
	immunizations: z.array(z.any()).optional(),
	vitalSigns: z.array(z.any()).optional(),
	prescriptions: z.array(z.any()).optional(),
	growthRecords: z.array(z.any()).optional(),
	payments: z.array(z.any()).optional(),
	guardians: z.array(z.any()).optional()
});

// ================ PATIENT PROCEDURES ================

// Create patient
export const createPatient = protectedProcedure
	.input(PatientCreateSchema)
	.output(PatientSchema)
	.handler(async ({ input, context }) => {
		const [newPatient] = await db
			.insert(patient)
			.values({
				...input,
				clinicId: context.clinicId || "default-clinic-id",
				createdById: context.user?.id ?? "",
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return newPatient;
	});

// Get patient by ID
export const getPatient = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(PatientSchema.nullable())
	.handler(async ({ input, context }) => {
		const result = await db.query.patient.findFirst({
			where: and(
				eq(patient.id, input.id),
				eq(patient.clinicId, context.clinicId || ""),
				eq(patient.isDeleted, false)
			)
		});
		return result ?? null;
	});

// Get patient with full details (appointments, medical records, etc.)
export const getPatientWithDetails = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(PatientWithRelationsSchema.nullable())
	.handler(async ({ input, context }) => {
		const result = await db.query.patient.findFirst({
			where: and(
				eq(patient.id, input.id),
				eq(patient.clinicId, context.clinicId || ""),
				eq(patient.isDeleted, false)
			),
			with: {
				appointments: {
					with: {
						doctor: true,
						service: true
					},
					orderBy: desc(appointment.appointmentDate)
				},
				medicalRecords: {
					with: {
						doctor: true,
						encounter: true
					},
					orderBy: desc(medicalRecord.createdAt)
				},
				encounters: {
					with: {
						doctor: true
					},
					orderBy: desc(diagnosis.date)
				},
				immunizations: {
					orderBy: desc(immunization.date)
				},
				vitalSigns: {
					orderBy: desc(vitalSign.recordedAt)
				},
				prescriptions: {
					with: {
						doctor: true,
						prescribedItems: true
					},
					orderBy: desc(prescription.issuedDate)
				},
				growthRecords: {
					orderBy: desc(growthRecord.recordedAt)
				},
				payments: {
					orderBy: desc(payment.paymentDate)
				},
				guardians: {
					with: {
						user: true
					}
				}
			}
		});
		return result ?? null;
	});

// List patients with pagination and filters
export const listPatients = protectedProcedure
	.input(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(10),
			offset: z.number().optional(),
			search: z.string().optional(),
			status: z.string().optional(),
			isActive: z.boolean().optional(),
			gender: z.string().optional(),
			bloodGroup: z.string().optional()
		})
	)
	.output(
		z.object({
			patients: z.array(PatientSchema),
			total: z.number(),
			page: z.number(),
			limit: z.number(),
			totalPages: z.number()
		})
	)
	.handler(async ({ input, context }) => {
		const { page, limit, offset: manualOffset, search, status, isActive, gender, bloodGroup } = input;
		const offset = manualOffset ?? (page - 1) * limit;

		let whereClause = and(eq(patient.clinicId, context.clinicId || ""), eq(patient.isDeleted, false));

		if (search) {
			whereClause = and(
				whereClause,
				or(
					like(patient.firstName, `%${search}%`),
					like(patient.lastName, `%${search}%`),
					like(patient.email, `%${search}%`),
					like(patient.phone, `%${search}%`)
				)
			);
		}

		if (status) {
			whereClause = and(whereClause, eq(patient.status, status));
		}

		if (isActive !== undefined) {
			whereClause = and(whereClause, eq(patient.isActive, isActive));
		}

		if (gender) {
			whereClause = and(whereClause, eq(patient.gender, gender));
		}

		if (bloodGroup) {
			whereClause = and(whereClause, eq(patient.bloodGroup, bloodGroup));
		}

		const patientsList = await db.query.patient.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: desc(patient.createdAt)
		});

		const totalResult = await db.select({ count: sql<number>`count(*)` }).from(patient).where(whereClause).get();

		const total = totalResult?.count ?? 0;

		return {
			patients: patientsList,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	});

// Update patient
export const updatePatient = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			data: PatientUpdateSchema
		})
	)
	.output(PatientSchema)
	.handler(async ({ input, context }) => {
		const [updated] = await db
			.update(patient)
			.set({
				...input.data,
				updatedById: context.user?.id,
				updatedAt: new Date()
			})
			.where(and(eq(patient.id, input.id), eq(patient.clinicId, context.clinicId || "")))
			.returning();

		if (!updated) {
			throw new Error("Patient not found");
		}

		return updated;
	});

// Soft delete patient
export const deletePatient = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		await db
			.update(patient)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				updatedAt: new Date()
			})
			.where(and(eq(patient.id, input.id), eq(patient.clinicId, context.clinicId || "")));
		return true;
	});

// Hard delete patient (permanent)
export const hardDeletePatient = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		await db.delete(patient).where(and(eq(patient.id, input.id), eq(patient.clinicId, context.clinicId || "")));
		return true;
	});

// Get patient statistics
export const getPatientStats = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(
		z.object({
			totalAppointments: z.number(),
			completedAppointments: z.number(),
			cancelledAppointments: z.number(),
			totalPayments: z.number(),
			paidAmount: z.number(),
			dueAmount: z.number(),
			totalPrescriptions: z.number(),
			activePrescriptions: z.number(),
			totalImmunizations: z.number(),
			lastVisit: z.date().nullable(),
			nextAppointment: z.date().nullable()
		})
	)
	.handler(async ({ input, context }) => {
		const patientId = input.id;

		// Get appointment stats
		const appointmentStats = context.db
			.select({
				total: sql<number>`count(*)`,
				completed: sql<number>`sum(case when ${appointment.status} = 'COMPLETED' then 1 else 0 end)`,
				cancelled: sql<number>`sum(case when ${appointment.status} = 'CANCELLED' then 1 else 0 end)`,
				lastVisit: sql<Date>`max(case when ${appointment.status} = 'COMPLETED' then ${appointment.appointmentDate} else null end)`,
				nextAppointment: sql<Date>`min(case when ${appointment.appointmentDate} > datetime('now') and ${appointment.status} not in ('CANCELLED', 'COMPLETED') then ${appointment.appointmentDate} else null end)`
			})
			.from(appointment)
			.where(and(eq(appointment.patientId, patientId), eq(appointment.isDeleted, false)))
			.get();

		// Get payment stats
		const paymentStats = context.db
			.select({
				total: sql<number>`count(*)`,
				paidAmount: sql<number>`coalesce(sum(${payment.amountPaid}), 0)`,
				totalAmount: sql<number>`coalesce(sum(${payment.totalAmount}), 0)`
			})
			.from(payment)
			.where(and(eq(payment.patientId, patientId), eq(payment.isDeleted, false)))
			.get();

		// Get prescription stats
		const prescriptionStats = context.db
			.select({
				total: sql<number>`count(*)`,
				active: sql<number>`sum(case when ${prescription.status} = 'active' then 1 else 0 end)`
			})
			.from(prescription)
			.where(eq(prescription.patientId, patientId))
			.get();

		// Get immunization count
		const immunizationCount = context.db
			.select({ count: sql<number>`count(*)` })
			.from(immunization)
			.where(and(eq(immunization.patientId, patientId), eq(immunization.isDeleted, false)))
			.get();

		return {
			totalAppointments: appointmentStats?.total ?? 0,
			completedAppointments: appointmentStats?.completed ?? 0,
			cancelledAppointments: appointmentStats?.cancelled ?? 0,
			totalPayments: paymentStats?.total ?? 0,
			paidAmount: paymentStats?.paidAmount ?? 0,
			dueAmount: (paymentStats?.totalAmount ?? 0) - (paymentStats?.paidAmount ?? 0),
			totalPrescriptions: prescriptionStats?.total ?? 0,
			activePrescriptions: prescriptionStats?.active ?? 0,
			totalImmunizations: immunizationCount?.count ?? 0,
			lastVisit: appointmentStats?.lastVisit ?? null,
			nextAppointment: appointmentStats?.nextAppointment ?? null
		};
	});

// Search patients with advanced filters
export const searchPatients = protectedProcedure
	.input(
		z.object({
			query: z.string(),
			limit: z.number().default(20),
			includeDeleted: z.boolean().default(false)
		})
	)
	.output(z.array(PatientSchema))
	.handler(async ({ input, context }) => {
		const { query, limit, includeDeleted } = input;

		const whereClause = and(
			eq(patient.clinicId, context.clinicId || ""),
			includeDeleted ? undefined : eq(patient.isDeleted, false),
			or(
				like(patient.firstName, `%${query}%`),
				like(patient.lastName, `%${query}%`),
				like(patient.email, `%${query}%`),
				like(patient.phone, `%${query}%`),
				sql`${patient.firstName} || ' ' || ${patient.lastName} LIKE ${`%${query}%`}`
			)
		);

		const results = await db.query.patient.findMany({
			where: whereClause,
			limit,
			orderBy: [asc(patient.firstName), asc(patient.lastName)]
		});

		return results;
	});

// Bulk create patients
export const bulkCreatePatients = protectedProcedure
	.input(z.array(PatientCreateSchema))
	.output(z.array(PatientSchema))
	.handler(async ({ input, context }) => {
		const patientsToInsert = input.map(patientData => ({
			...patientData,
			id: crypto.randomUUID(),
			clinicId: context.clinicId || "",
			createdById: context.user?.id ?? "",
			createdAt: new Date(),
			updatedAt: new Date()
		}));

		const results = await db.insert(patient).values(patientsToInsert).returning();
		return results;
	});

// Export all procedures
export const patientRouter = {
	createPatient,
	getPatient,
	getPatientWithDetails,
	listPatients,
	updatePatient,
	deletePatient,
	hardDeletePatient,
	getPatientStats,
	searchPatients,
	bulkCreatePatients
};
