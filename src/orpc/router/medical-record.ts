// orpc/router/medical-record.router.ts
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { appointment, diagnosis, growthRecord, medicalRecord, vitalSign } from "../../db/schema";
import { generateId } from "../../lib/id";
import { protectedProcedure } from "../init";
import {
	DiagnosisCreateSchema,
	DiagnosisSchema,
	GrowthRecordSchema,
	MedicalRecordSchema,
	MedicalRecordsUpdateSchema,
	VitalSignSchema
} from "../schema";

const VitalSignsCreateSchema = VitalSignSchema.omit({
	id: true
});
const MedicalRecordCreateSchema = MedicalRecordSchema.omit({
	id: true
});
// ================ MEDICAL RECORD PROCEDURES ================

// Create complete medical record with diagnosis and vitals
export const createMedicalRecord = protectedProcedure
	.input(
		z.object({
			record: MedicalRecordCreateSchema,
			diagnosis: DiagnosisCreateSchema.optional(),
			vitals: VitalSignsCreateSchema.optional()
		})
	)
	.output(MedicalRecordSchema)
	.handler(async ({ input }) => {
		const recordId = crypto.randomUUID();

		// Create medical record
		const [record] = await db
			.insert(medicalRecord)
			.values({
				...input.record,
				id: recordId,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Create diagnosis if provided
		if (input.diagnosis) {
			await db.insert(diagnosis).values({
				id: crypto.randomUUID(),
				medicalId: recordId,
				patientId: input.record.patientId,
				doctorId: input.diagnosis.doctorId ?? "",
				appointmentId: input.record.appointmentId,
				symptoms: input.diagnosis.symptoms,
				diagnosis: input.diagnosis.diagnosis,
				treatment: input.diagnosis.treatment,
				type: input.diagnosis.type,
				notes: input.diagnosis.notes,
				prescribedMedications: input.diagnosis.prescribedMedications,
				followUpPlan: input.diagnosis.followUpPlan,
				date: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		// Create vitals if provided
		if (input.vitals) {
			await db.insert(vitalSign).values({
				id: crypto.randomUUID(),
				medicalId: recordId,
				patientId: input.vitals.patientId,
				encounterId: input.vitals.encounterId,
				bodyTemperature: input.vitals.bodyTemperature,
				systolic: input.vitals.systolic,
				diastolic: input.vitals.diastolic,
				heartRate: input.vitals.heartRate,
				respiratoryRate: input.vitals.respiratoryRate,
				oxygenSaturation: input.vitals.oxygenSaturation,
				gender: input.vitals.gender,
				notes: input.vitals.notes,
				ageDays: input.vitals.ageDays,
				ageMonths: input.vitals.ageMonths,
				recordedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		return record;
	});

// Get medical record by ID with full relations
export const getMedicalRecordById = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(
		MedicalRecordSchema.extend({
			patient: z
				.object({
					id: z.string(),
					firstName: z.string(),
					lastName: z.string(),
					dateOfBirth: z.date(),
					gender: z.string().nullable()
				})
				.nullable(),
			doctor: z
				.object({
					id: z.string(),
					name: z.string(),
					specialty: z.string()
				})
				.nullable(),
			appointment: z
				.object({
					id: z.string(),
					appointmentDate: z.date(),
					status: z.string().nullable()
				})
				.nullable(),
			encounter: z.array(DiagnosisSchema).nullable(),
			vitalSigns: z.array(VitalSignSchema).nullable(),
			prescriptions: z.array(z.any()).nullable()
		})
	)
	.handler(async ({ input }) => {
		const record = await db.query.medicalRecord.findFirst({
			where: eq(medicalRecord.id, input.id),
			with: {
				patient: {
					columns: {
						id: true,
						firstName: true,
						lastName: true,
						dateOfBirth: true,
						gender: true
					}
				},
				doctor: {
					columns: {
						id: true,
						name: true,
						specialty: true
					}
				},
				appointment: {
					columns: {
						id: true,
						appointmentDate: true,
						status: true
					}
				},
				encounter: true,
				vitalSigns: true,
				prescriptions: true
			}
		});

		if (!record) {
			throw new Error("Medical record not found");
		}

		return {
			...record,
			encounter: record.encounter.map(e => ({
				...e,
				type: e.type ?? null,
				diagnosis: e.diagnosis ?? null,
				treatment: e.treatment ?? null
			}))
		};
	});

// Get patient medical history
export const getPatientMedicalHistory = protectedProcedure
	.input(
		z.object({
			patientId: z.string(),
			limit: z.number().default(20),
			offset: z.number().default(0),
			includeDeleted: z.boolean().default(false)
		})
	)
	.output(
		z.object({
			records: z.array(
				MedicalRecordSchema.extend({
					doctor: z
						.object({
							id: z.string(),
							name: z.string(),
							specialty: z.string()
						})
						.nullable(),
					appointment: z
						.object({
							id: z.string(),
							appointmentDate: z.date()
						})
						.nullable(),
					diagnosisCount: z.number(),
					vitalSignsCount: z.number()
				})
			),
			total: z.number(),
			hasMore: z.boolean()
		})
	)
	.handler(async ({ input }) => {
		const { patientId, limit, offset, includeDeleted } = input;

		const whereConditions = and(
			eq(medicalRecord.patientId, patientId),
			includeDeleted ? undefined : eq(medicalRecord.isDeleted, false)
		);

		const records = await db.query.medicalRecord.findMany({
			where: whereConditions,
			with: {
				doctor: {
					columns: {
						id: true,
						name: true,
						specialty: true
					}
				},
				appointment: {
					columns: {
						id: true,
						appointmentDate: true
					}
				}
			},
			limit,
			offset,
			orderBy: desc(medicalRecord.createdAt)
		});

		// Get counts for diagnosis and vitals per record
		const enrichedRecords = await Promise.all(
			records.map(async record => {
				const diagnosisCount = await db.$count(diagnosis, eq(diagnosis.medicalId, record.id));
				const vitalSignsCount = await db.$count(vitalSign, eq(vitalSign.medicalId, record.id));

				return {
					...record,
					diagnosisCount,
					vitalSignsCount
				};
			})
		);

		const total = await db.$count(medicalRecord, whereConditions);
		const hasMore = offset + limit < total;

		return { records: enrichedRecords, total, hasMore };
	});

// Update medical record
export const updateMedicalRecord = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			data: MedicalRecordsUpdateSchema
		})
	)
	.output(MedicalRecordSchema)
	.handler(async ({ input }) => {
		const [updated] = await db
			.update(medicalRecord)
			.set({
				...input.data,
				updatedAt: new Date()
			})
			.where(eq(medicalRecord.id, input.id))
			.returning();

		if (!updated) {
			throw new Error("Medical record not found");
		}

		return updated;
	});

// Delete (soft delete) medical record
export const deleteMedicalRecord = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.object({ success: z.boolean(), id: z.string() }))
	.handler(async ({ input }) => {
		await db
			.update(medicalRecord)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(medicalRecord.id, input.id));

		return { success: true, id: input.id };
	});

// ================ DIAGNOSIS PROCEDURES ================

// Get diagnosis by medical record ID
export const getDiagnosesByMedicalRecord = protectedProcedure
	.input(z.object({ medicalId: z.string() }))
	.output(z.array(DiagnosisSchema))
	.handler(async ({ input }) => {
		const diagnoses = await db.query.diagnosis.findMany({
			where: eq(diagnosis.medicalId, input.medicalId),
			orderBy: desc(diagnosis.date)
		});

		return diagnoses;
	});

// Create diagnosis for medical record
export const createDiagnosis = protectedProcedure
	.input(DiagnosisSchema.omit({ id: true }))
	.output(DiagnosisSchema)
	.handler(async ({ input }) => {
		const [diagnosisRecord] = await db
			.insert(diagnosis)
			.values({
				id: generateId(),
				...input,
				date: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return diagnosisRecord;
	});

// Update diagnosis
export const updateDiagnosis = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			data: DiagnosisCreateSchema.partial()
		})
	)
	.output(DiagnosisSchema)
	.handler(async ({ input }) => {
		const [updated] = await db
			.update(diagnosis)
			.set({
				...input.data,
				updatedAt: new Date()
			})
			.where(eq(diagnosis.id, input.id))
			.returning();

		if (!updated) {
			throw new Error("Diagnosis not found");
		}

		return updated;
	});

// ================ VITAL SIGNS PROCEDURES ================

// Get vital signs by medical record ID
export const getVitalSignsByMedicalRecord = protectedProcedure
	.input(z.object({ medicalId: z.string() }))
	.output(z.array(VitalSignSchema))
	.handler(async ({ input }) => {
		const vitals = await db.query.vitalSign.findMany({
			where: eq(vitalSign.medicalId, input.medicalId),
			orderBy: desc(vitalSign.recordedAt)
		});

		return vitals;
	});

// Create vital sign record
export const createVitalSign = protectedProcedure
	.input(VitalSignsCreateSchema)
	.output(VitalSignSchema)
	.handler(async ({ input }) => {
		const id = crypto.randomUUID();

		const [vital] = await db
			.insert(vitalSign)
			.values({
				id,
				...input,
				recordedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return vital;
	});

// Get latest vital signs for a patient
export const getLatestVitalSigns = protectedProcedure
	.input(z.object({ patientId: z.string(), limit: z.number().default(5) }))
	.output(z.array(VitalSignSchema))
	.handler(async ({ input }) => {
		const vitals = await db.query.vitalSign.findMany({
			where: eq(vitalSign.patientId, input.patientId),
			limit: input.limit,
			orderBy: desc(vitalSign.recordedAt)
		});

		return vitals;
	});

// ================ COMPLETE MEDICAL ENCOUNTER ================

// Create a complete medical encounter (record + diagnosis + vitals)
export const createCompleteEncounter = protectedProcedure
	.input(
		z.object({
			patientId: z.string(),
			appointmentId: z.string(),
			doctorId: z.string(),
			diagnosis: z.object({
				symptoms: z.string(),
				diagnosis: z.string().optional(),
				treatment: z.string().optional(),
				type: z.string().optional(),
				prescribedMedications: z.string().optional(),
				followUpPlan: z.string().optional()
			}),
			vitals: z
				.object({
					bodyTemperature: z.number().optional(),
					systolic: z.number().optional(),
					diastolic: z.number().optional(),
					heartRate: z.number().optional(),
					respiratoryRate: z.number().optional(),
					oxygenSaturation: z.number().optional(),
					notes: z.string().optional()
				})
				.optional(),
			medicalRecord: z
				.object({
					notes: z.string().optional(),
					treatmentPlan: z.string().optional(),
					labRequest: z.string().optional(),
					medications: z.string().optional(),
					followUpDate: z.date().optional()
				})
				.optional(),
			growth: z
				.object({
					weight: z.number().optional(),
					height: z.number().optional(),
					headCircumference: z.number().optional(),
					notes: z.string().optional()
				})
				.optional()
		})
	)
	.output(
		z.object({
			medicalRecord: MedicalRecordSchema,
			diagnosis: DiagnosisSchema,
			vitalSigns: VitalSignSchema.optional(),
			growthRecord: GrowthRecordSchema.optional()
		})
	)
	.handler(async ({ input }) => {
		const recordId = generateId();

		// Get appointment to fetch clinicId
		const appointmentData = await db.query.appointment.findFirst({
			where: eq(appointment.id, input.appointmentId),
			columns: { clinicId: true }
		});

		if (!appointmentData?.clinicId) {
			throw new Error("Appointment not found or clinic not assigned");
		}

		// Update appointment status to completed
		await db
			.update(appointment)
			.set({ status: "COMPLETED", updatedAt: new Date() })
			.where(eq(appointment.id, input.appointmentId));

		// Create medical record
		const [record] = await db
			.insert(medicalRecord)
			.values({
				id: recordId,
				clinicId: appointmentData.clinicId,
				patientId: input.patientId,
				appointmentId: input.appointmentId,
				doctorId: input.doctorId,
				notes: input.medicalRecord?.notes,
				treatmentPlan: input.medicalRecord?.treatmentPlan,
				labRequest: input.medicalRecord?.labRequest,
				medications: input.medicalRecord?.medications,
				followUpDate: input.medicalRecord?.followUpDate,
				diagnosisDate: new Date(),
				status: "ACTIVE",
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Create diagnosis
		const [diagnosisRecord] = await db
			.insert(diagnosis)
			.values({
				id: crypto.randomUUID(),
				medicalId: recordId,
				patientId: input.patientId,
				doctorId: input.doctorId,
				appointmentId: input.appointmentId,
				symptoms: input.diagnosis.symptoms,
				diagnosis: input.diagnosis.diagnosis,
				treatment: input.diagnosis.treatment,
				type: input.diagnosis.type,
				prescribedMedications: input.diagnosis.prescribedMedications,
				followUpPlan: input.diagnosis.followUpPlan,
				date: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		let vitalRecord: z.infer<typeof VitalSignSchema> | undefined;

		// Create vitals if provided
		if (input.vitals) {
			const [vital] = await db
				.insert(vitalSign)
				.values({
					id: crypto.randomUUID(),
					medicalId: recordId,
					patientId: input.patientId,
					encounterId: diagnosisRecord.id,
					bodyTemperature: input.vitals.bodyTemperature,
					systolic: input.vitals.systolic,
					diastolic: input.vitals.diastolic,
					heartRate: input.vitals.heartRate,
					respiratoryRate: input.vitals.respiratoryRate,
					oxygenSaturation: input.vitals.oxygenSaturation,
					notes: input.vitals.notes,
					recordedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			vitalRecord = vital;
		}

		let growth: z.infer<typeof GrowthRecordSchema> | undefined;

		// Create growth record if provided
		if (input.growth) {
			const [newGrowth] = await db
				.insert(growthRecord)
				.values({
					id: crypto.randomUUID(),
					patientId: input.patientId,
					weight: input.growth.weight,
					height: input.growth.height,
					headCircumference: input.growth.headCircumference,
					notes: input.growth.notes,
					date: new Date(),
					recordedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			growth = newGrowth;
		}

		return {
			medicalRecord: record,
			diagnosis: diagnosisRecord,
			vitalSigns: vitalRecord,
			growthRecord: growth
		};
	});
