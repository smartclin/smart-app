// orpc/router/encounter.ts
import { os } from "@orpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { diagnosis, medicalRecord, prescription, vitalSign } from "../../db/schema";
import { generateId } from "../../lib/id";
import { protectedProcedure } from "../init";
import { DiagnosisCreateSchema, DiagnosisSchema, DiagnosisUpdateSchema } from "../schema";

// // Schema definitions
// const DiagnosisSchema = z.object({
// 	id: z.string(),
// 	patientId: z.string(),
// 	doctorId: z.string(),
// 	clinicId: z.string().optional(),
// 	appointmentId: z.string().optional(),
// 	medicalId: z.string(),
// 	date: z.date(),
// 	type: z.string(),
// 	diagnosis: z.string().optional(),
// 	treatment: z.string().optional(),
// 	status: z.string().default("ACTIVE"),
// 	notes: z.string().optional(),
// 	symptoms: z.string(),
// 	prescribedMedications: z.string().optional(),
// 	followUpPlan: z.string().optional(),
// 	isDeleted: z.boolean().default(false),
// 	createdAt: z.date(),
// 	updatedAt: z.date()
// });

// const CreateEncounterSchema = z.object({
// 	patientId: z.string(),
// 	doctorId: z.string(),
// 	clinicId: z.string().optional(),
// 	appointmentId: z.string().optional(),
// 	date: z.date(),
// 	type: z.string(),
// 	diagnosis: z.string().optional(),
// 	symptoms: z.string(),
// 	treatment: z.string().optional(),
// 	notes: z.string().optional(),
// 	prescribedMedications: z.string().optional(),
// 	followUpPlan: z.string().optional(),
// 	status: z.string().default("ACTIVE")
// });

// const UpdateEncounterSchema = CreateEncounterSchema.partial().extend({
// 	id: z.string()
// });

const CompleteEncounterSchema = z.object({
	encounterId: z.string(),
	diagnosis: z.string(),
	treatment: z.string(),
	medications: z
		.array(
			z.object({
				name: z.string(),
				dosage: z.string(),
				frequency: z.string(),
				duration: z.string()
			})
		)
		.optional(),
	followUpDate: z.date().optional(),
	notes: z.string().optional()
});

const AddPrescriptionSchema = z.object({
	encounterId: z.string(),
	patientId: z.string(),
	doctorId: z.string(),
	medicationName: z.string(),
	instructions: z.string(),
	issuedDate: z.date(),
	endDate: z.date().optional(),
	status: z.string().default("active")
});

const AddVitalSignsSchema = z.object({
	encounterId: z.string(),
	patientId: z.string(),
	medicalId: z.string(),
	bodyTemperature: z.number().optional(),
	systolic: z.number().optional(),
	diastolic: z.number().optional(),
	heartRate: z.number().optional(),
	respiratoryRate: z.number().optional(),
	oxygenSaturation: z.number().optional(),
	notes: z.string().optional(),
	ageDays: z.number().optional(),
	ageMonths: z.number().optional()
});

const ListEncountersSchema = z.object({
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	appointmentId: z.string().optional(),
	status: z.string().optional(),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
	searchTerm: z.string().optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(20)
});

// Create a new encounter
export const createEncounter = protectedProcedure
	.input(DiagnosisCreateSchema)
	.output(DiagnosisSchema)
	.handler(async ({ input, context }) => {
		const medicalId = generateId();

		const [record] = await context.db
			.insert(diagnosis)
			.values({
				id: generateId(),
				clinicId: input.clinicId || "",
				patientId: input.patientId,
				doctorId: input.doctorId,
				appointmentId: input.appointmentId,
				medicalId,
				date: input.date,
				type: input.type,
				diagnosis: input.diagnosis || undefined,
				symptoms: input.symptoms,
				treatment: input.treatment || null,
				notes: input.notes || null,
				prescribedMedications: input.prescribedMedications || null,
				followUpPlan: input.followUpPlan || null,
				status: input.status,
				isDeleted: false,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Create medical record if appointment exists
		if (input.appointmentId) {
			await db.insert(medicalRecord).values({
				id: crypto.randomUUID(),
				patientId: input.patientId,
				appointmentId: input.appointmentId,
				doctorId: input.doctorId,
				clinicId: input.clinicId || "",
				diagnosis: input.diagnosis || null,
				symptoms: input.symptoms,
				treatmentPlan: input.treatment || null,
				notes: input.notes || null,
				diagnosisDate: input.date,
				status: "ACTIVE",
				isDeleted: false,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		return record;
	});

// Update an encounter
export const updateEncounter = protectedProcedure
	.input(DiagnosisUpdateSchema)
	.output(DiagnosisSchema)
	.handler(async ({ input, context }) => {
		if (!input.id) {
			throw new Error("Encounter ID is required for update");
		}

		const [updated] = await context.db
			.update(diagnosis)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(diagnosis.id, input.id as string))
			.returning();

		if (!updated) {
			throw new Error("Encounter not found");
		}

		return updated;
	});

// Complete an encounter with full medical details
export const completeEncounter = protectedProcedure
	.input(CompleteEncounterSchema)
	.output(z.object({ success: z.boolean(), encounter: DiagnosisSchema }))
	.handler(async ({ input }) => {
		const [encounter] = await db
			.update(diagnosis)
			.set({
				diagnosis: input.diagnosis,
				treatment: input.treatment,
				notes: input.notes,
				followUpPlan: input.followUpDate ? `Follow up on ${input.followUpDate.toISOString()}` : null,
				prescribedMedications: input.medications ? JSON.stringify(input.medications) : null,
				status: "COMPLETED",
				updatedAt: new Date()
			})
			.where(eq(diagnosis.id, input.encounterId))
			.returning();

		if (!encounter) {
			throw new Error("Encounter not found");
		}

		// Update related medical record
		if (encounter.appointmentId) {
			await db
				.update(medicalRecord)
				.set({
					diagnosis: input.diagnosis,
					treatmentPlan: input.treatment,
					medications: input.medications ? JSON.stringify(input.medications) : null,
					followUpDate: input.followUpDate,
					status: "COMPLETED",
					updatedAt: new Date()
				})
				.where(eq(medicalRecord.appointmentId, encounter.appointmentId));
		}

		return { success: true, encounter };
	});

// Add prescription to encounter
export const addPrescription = os
	.input(AddPrescriptionSchema)
	.output(z.object({ id: z.string(), success: z.boolean() }))
	.handler(async ({ input }) => {
		const [prescriptionRecord] = await db
			.insert(prescription)
			.values({
				id: crypto.randomUUID(),
				medicalRecordId: input.encounterId,
				doctorId: input.doctorId,
				patientId: input.patientId,
				encounterId: input.encounterId,
				medicationName: input.medicationName,
				instructions: input.instructions,
				issuedDate: input.issuedDate,
				endDate: input.endDate || null,
				status: input.status,
				clinicId: "",
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Update encounter with prescribed medications
		const encounter = await db.query.diagnosis.findFirst({
			where: eq(diagnosis.id, input.encounterId)
		});

		if (encounter) {
			const existingMeds = encounter.prescribedMedications ? JSON.parse(encounter.prescribedMedications) : [];
			const newMeds = [...existingMeds, { name: input.medicationName, instructions: input.instructions }];
			await db
				.update(diagnosis)
				.set({
					prescribedMedications: JSON.stringify(newMeds),
					updatedAt: new Date()
				})
				.where(eq(diagnosis.id, input.encounterId));
		}

		return { id: prescriptionRecord.id, success: true };
	});

// Add vital signs to encounter
export const addVitalSigns = os
	.input(AddVitalSignsSchema)
	.output(z.object({ id: z.string(), success: z.boolean() }))
	.handler(async ({ input }) => {
		const [vital] = await db
			.insert(vitalSign)
			.values({
				id: crypto.randomUUID(),
				clinicId: "",
				patientId: input.patientId,
				medicalId: input.medicalId,
				encounterId: input.encounterId,
				recordedAt: new Date(),
				bodyTemperature: input.bodyTemperature || null,
				systolic: input.systolic || null,
				diastolic: input.diastolic || null,
				heartRate: input.heartRate || null,
				respiratoryRate: input.respiratoryRate || null,
				oxygenSaturation: input.oxygenSaturation || null,
				notes: input.notes || null,
				ageDays: input.ageDays || null,
				ageMonths: input.ageMonths || null,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return { id: vital.id, success: true };
	});

// Get encounter by ID with full details
export const getEncounter = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(
		DiagnosisSchema.extend({
			patient: z
				.object({
					id: z.string(),
					firstName: z.string(),
					lastName: z.string(),
					dateOfBirth: z.date(),
					gender: z.string().nullable(),
					phone: z.string().nullable().optional(),
					email: z.string().nullable().optional()
				})
				.optional(),
			doctor: z
				.object({
					id: z.string(),
					name: z.string(),
					specialty: z.string(),
					email: z.string().nullable().optional(),
					phone: z.string().nullable()
				})
				.optional(),
			appointment: z
				.object({
					id: z.string(),
					appointmentDate: z.date(),
					type: z.string(),
					status: z.string()
				})
				.optional(),
			prescriptions: z
				.array(
					z.object({
						id: z.string(),
						medicationName: z.string().nullable(),
						instructions: z.string().nullable(),
						issuedDate: z.date(),
						status: z.string()
					})
				)
				.optional(),
			vitalSigns: z
				.array(
					z.object({
						id: z.string(),
						bodyTemperature: z.number().nullable(),
						systolic: z.number().nullable(),
						diastolic: z.number().nullable(),
						heartRate: z.number().nullable(),
						respiratoryRate: z.number().nullable(),
						oxygenSaturation: z.number().nullable(),
						recordedAt: z.date()
					})
				)
				.optional()
		})
	)
	.handler(async ({ input }) => {
		const encounter = await db.query.diagnosis.findFirst({
			where: and(eq(diagnosis.id, input.id), eq(diagnosis.isDeleted, false)),
			with: {
				patient: {
					columns: {
						id: true,
						firstName: true,
						lastName: true,
						dateOfBirth: true,
						gender: true,
						phone: true,
						email: true
					}
				},
				doctor: {
					columns: {
						id: true,
						name: true,
						specialty: true,
						email: true,
						phone: true
					}
				},
				appointment: {
					columns: {
						id: true,
						appointmentDate: true,
						type: true,
						status: true
					}
				} as const,
				prescription: {
					columns: {
						id: true,
						medicationName: true,
						instructions: true,
						issuedDate: true,
						status: true
					}
				},
				vitalSigns: {
					columns: {
						id: true,
						bodyTemperature: true,
						systolic: true,
						diastolic: true,
						heartRate: true,
						respiratoryRate: true,
						oxygenSaturation: true,
						recordedAt: true
					}
				}
			}
		});

		if (!encounter) {
			throw new Error("Encounter not found");
		}

		return {
			...encounter,
			appointment: encounter.appointment
				? { ...encounter.appointment, status: encounter.appointment.status ?? "PENDING" }
				: undefined,
			patient: encounter.patient ?? undefined,
			doctor: encounter.doctor ?? undefined,
			prescriptions: encounter.prescription.map(p => ({ ...p, status: p.status ?? "active" })),
			vitalSigns: encounter.vitalSigns,
			type: encounter.type ?? null
		};
	});

// List encounters with filtering and pagination
export const listEncounters = os
	.input(ListEncountersSchema)
	.output(
		z.object({
			encounters: z.array(
				DiagnosisSchema.extend({
					patientName: z.string().optional(),
					doctorName: z.string().optional()
				})
			),
			total: z.number(),
			page: z.number(),
			pageSize: z.number(),
			totalPages: z.number()
		})
	)
	.handler(async ({ input }) => {
		const conditions = and(
			eq(diagnosis.isDeleted, false),
			input.patientId ? eq(diagnosis.patientId, input.patientId) : undefined,
			input.doctorId ? eq(diagnosis.doctorId, input.doctorId) : undefined,
			input.appointmentId ? eq(diagnosis.appointmentId, input.appointmentId) : undefined,
			input.status ? eq(diagnosis.status, input.status) : undefined,
			input.dateFrom ? sql`${diagnosis.date} >= ${input.dateFrom}` : undefined,
			input.dateTo ? sql`${diagnosis.date} <= ${input.dateTo}` : undefined,
			input.searchTerm
				? sql`(
				${diagnosis.diagnosis} LIKE ${`%${input.searchTerm}%`} OR
				${diagnosis.symptoms} LIKE ${`%${input.searchTerm}%`} OR
				${diagnosis.treatment} LIKE ${`%${input.searchTerm}%`}
			)`
				: undefined
		);

		const encounters = await db.query.diagnosis.findMany({
			where: conditions,
			limit: input.pageSize,
			offset: (input.page - 1) * input.pageSize,
			orderBy: desc(diagnosis.date),
			with: {
				patient: {
					columns: {
						firstName: true,
						lastName: true
					}
				},
				doctor: {
					columns: {
						name: true
					}
				}
			}
		});

		const total = await db.$count(diagnosis, conditions);

		const encountersWithNames = encounters.map(encounter => ({
			...encounter,
			patientName: encounter.patient ? `${encounter.patient.firstName} ${encounter.patient.lastName}` : undefined,
			doctorName: encounter.doctor ? encounter.doctor.name : undefined
		}));

		return {
			encounters: encountersWithNames,
			total,
			page: input.page,
			pageSize: input.pageSize,
			totalPages: Math.ceil(total / input.pageSize)
		};
	});

// Delete encounter (soft delete)
export const deleteEncounter = os
	.input(z.object({ id: z.string() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input }) => {
		await db
			.update(diagnosis)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(diagnosis.id, input.id));

		return { success: true };
	});

// Get encounters by date range
export const getEncountersByDateRange = os
	.input(
		z.object({
			startDate: z.date(),
			endDate: z.date(),
			doctorId: z.string().optional(),
			clinicId: z.string().optional()
		})
	)
	.output(z.array(DiagnosisSchema))
	.handler(async ({ input }) => {
		const conditions = and(
			eq(diagnosis.isDeleted, false),
			sql`${diagnosis.date} BETWEEN ${input.startDate} AND ${input.endDate}`,
			input.doctorId ? eq(diagnosis.doctorId, input.doctorId) : undefined,
			input.clinicId ? eq(diagnosis.clinicId, input.clinicId) : undefined
		);

		const encounters = await db.query.diagnosis.findMany({
			where: conditions,
			orderBy: desc(diagnosis.date)
		});

		return encounters;
	});

// Get encounter statistics
export const getEncounterStats = os
	.input(
		z.object({
			clinicId: z.string().optional(),
			doctorId: z.string().optional(),
			startDate: z.date().optional(),
			endDate: z.date().optional()
		})
	)
	.output(
		z.object({
			totalEncounters: z.number(),
			activeEncounters: z.number(),
			completedEncounters: z.number(),
			avgPerDay: z.number(),
			topDiagnosis: z.array(
				z.object({
					diagnosis: z.string(),
					count: z.number()
				})
			),
			encountersByType: z.array(
				z.object({
					type: z.string(),
					count: z.number()
				})
			)
		})
	)
	.handler(async ({ input }) => {
		const conditions = and(
			eq(diagnosis.isDeleted, false),
			input.clinicId ? eq(diagnosis.clinicId, input.clinicId) : undefined,
			input.doctorId ? eq(diagnosis.doctorId, input.doctorId) : undefined,
			input.startDate ? sql`${diagnosis.date} >= ${input.startDate}` : undefined,
			input.endDate ? sql`${diagnosis.date} <= ${input.endDate}` : undefined
		);

		const allEncounters = await db.query.diagnosis.findMany({
			where: conditions
		});

		const totalEncounters = allEncounters.length;
		const activeEncounters = allEncounters.filter(e => e.status === "ACTIVE").length;
		const completedEncounters = allEncounters.filter(e => e.status === "COMPLETED").length;

		// Calculate average per day
		const dates = allEncounters.map(e => e.date.toDateString());
		const uniqueDates = new Set(dates);
		const avgPerDay = uniqueDates.size > 0 ? totalEncounters / uniqueDates.size : 0;

		// Get top diagnoses
		const diagnosisCounts = new Map<string, number>();
		for (const encounter of allEncounters) {
			if (encounter.diagnosis) {
				diagnosisCounts.set(encounter.diagnosis, (diagnosisCounts.get(encounter.diagnosis) || 0) + 1);
			}
		}
		const topDiagnosis = Array.from(diagnosisCounts.entries())
			.map(([diagnosis, count]) => ({ diagnosis, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		// Get encounters by type
		const typeCounts = new Map<string, number>();
		for (const diagnosis of allEncounters) {
			typeCounts.set(diagnosis.type ?? "", (typeCounts.get(diagnosis.type ?? "") || 0) + 1);
		}
		const encountersByType = Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count }));

		return {
			totalEncounters,
			activeEncounters,
			completedEncounters,
			avgPerDay,
			topDiagnosis,
			encountersByType
		};
	});
