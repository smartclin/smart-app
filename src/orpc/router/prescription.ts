// routers/prescription.router.ts
import { and, eq, like, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { drug, prescribedItem, prescription } from "../../db/schema";
import { protectedProcedure } from "../init";

// Create prescription with items
export const createPrescription = protectedProcedure
	.input(
		z.object({
			medicalRecordId: z.string(),
			patientId: z.string(),
			doctorId: z.string(),
			encounterId: z.string(),
			items: z.array(
				z.object({
					drugId: z.string(),
					dosageValue: z.number(),
					dosageUnit: z.string(),
					frequency: z.string(),
					duration: z.string(),
					instructions: z.string().optional()
				})
			)
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		const prescriptionId = crypto.randomUUID();

		// Create prescription
		const [newPrescription] = await db
			.insert(prescription)
			.values({
				id: prescriptionId,
				medicalRecordId: input.medicalRecordId,
				patientId: input.patientId,
				doctorId: input.doctorId,
				encounterId: input.encounterId,
				clinicId: context.clinicId
			})
			.returning();

		// Create prescribed items
		const prescribedItems = await Promise.all(
			input.items.map(async item => {
				const [prescribed] = await db
					.insert(prescribedItem)
					.values({
						id: crypto.randomUUID(),
						prescriptionId,
						...item
					})
					.returning();
				return prescribed;
			})
		);

		return { ...newPrescription, items: prescribedItems };
	});

// Get prescription by ID
export const getPrescription = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.any())
	.handler(async ({ input, context }) => {
		const result = await db.query.prescription.findFirst({
			where: and(eq(prescription.id, input.id), eq(prescription.clinicId, context.clinicId)),
			with: {
				prescribedItems: {
					with: {
						drug: true
					}
				},
				doctor: true,
				patient: true
			}
		});
		if (!result) {
			throw new Error("Prescription not found");
		}
		return result;
	});

// Get active prescriptions for patient
export const getPatientActivePrescriptions = protectedProcedure
	.input(z.object({ patientId: z.string() }))
	.output(z.array(z.any()))
	.handler(async ({ input, context }) => {
		return await db.query.prescription.findMany({
			where: and(
				eq(prescription.patientId, input.patientId),
				eq(prescription.clinicId, context.clinicId),
				eq(prescription.status, "active")
			),
			with: {
				prescribedItems: {
					with: {
						drug: true
					}
				},
				doctor: true
			},
			orderBy: (prescriptions, { desc }) => [desc(prescriptions.issuedDate)]
		});
	});

export const listDrugs = protectedProcedure
	.input(
		z.object({
			search: z.string().optional(),
			limit: z.number().default(50)
		})
	)
	.output(z.array(z.any()))
	.handler(async ({ input }) => {
		const { search, limit } = input;

		let whereClause;

		if (search) {
			whereClause = or(
				like(drug.name, `%${search}%`),
				like(drug.genericName, `%${search}%`),
				like(drug.brandName, `%${search}%`)
			);
		}

		const drugs = await db.query.drug.findMany({
			where: whereClause,
			limit,
			orderBy: (drug, { asc }) => [asc(drug.name)]
		});

		return drugs;
	});

export const updatePrescription = protectedProcedure
	.input(
		z.object({
			prescriptionId: z.string(),
			status: z.enum(["active", "completed", "cancelled", "expired"])
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		const { prescriptionId, status } = input;
		const updated = await db
			.update(prescription)
			.set({ status })
			.where(and(eq(prescription.id, prescriptionId), eq(prescription.clinicId, context.clinicId)))
			.returning();

		return updated[0];
	});
