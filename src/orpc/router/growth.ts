// routers/growth.router.ts
import { and, between, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { growthRecord, patient } from "../../db/schema";
import {
	calculateAgeInDays,
	calculateAgeInMonths,
	calculateZScore,
	getMeasurementValue,
	getWHOStandard,
	getZScoreValue
} from "../../utils/growth";
import { clinicProcedure } from "../init";

// Get patient growth history
export const getPatientGrowthHistory = clinicProcedure
	.input(
		z.object({
			patientId: z.string(),
			limit: z.number().optional().default(50),
			offset: z.number().optional().default(0)
		})
	)
	.handler(async ({ input, context }) => {
		const records = await db.query.growthRecord.findMany({
			where: and(eq(growthRecord.patientId, input.patientId), eq(growthRecord.clinicId, context.clinicId)),
			orderBy: (growthRecord, { desc }) => [desc(growthRecord.date)],
			limit: input.limit,
			offset: input.offset
		});

		const total = await db.$count(
			growthRecord,
			and(eq(growthRecord.patientId, input.patientId), eq(growthRecord.clinicId, context.clinicId))
		);

		return {
			records,
			total,
			limit: input.limit,
			offset: input.offset
		};
	});

// Record growth measurement
export const recordGrowth = clinicProcedure
	.input(
		z.object({
			patientId: z.string(),
			date: z.date(),
			weight: z.number().optional(),
			height: z.number().optional(),
			headCircumference: z.number().optional(),
			notes: z.string().optional()
		})
	)
	.handler(async ({ input, context }) => {
		const patientData = await db.query.patient.findFirst({
			where: eq(patient.id, input.patientId)
		});

		if (!patientData) throw new Error("Patient not found");

		// Calculate age in months and days
		const ageInMonths = calculateAgeInMonths(patientData.dateOfBirth, input.date);
		const ageInDays = calculateAgeInDays(patientData.dateOfBirth, input.date);

		if (!patientData.gender) {
			throw new Error("Patient gender is required");
		}
		const gender = patientData.gender;

		// Calculate Z-scores using WHO standards
		let weightForAgeZ = null;
		let heightForAgeZ = null;
		let hcForAgeZ = null;
		let bmiForAgeZ = null;

		if (input.weight) {
			const weightStandard = await getWHOStandard(ageInDays, gender, "WFA");
			if (weightStandard) {
				weightForAgeZ = calculateZScore(
					input.weight,
					weightStandard.mValue,
					weightStandard.lValue,
					weightStandard.sValue
				);
			}
		}

		if (input.height) {
			const heightStandard = await getWHOStandard(ageInDays, gender, "HFA");
			if (heightStandard) {
				heightForAgeZ = calculateZScore(
					input.height,
					heightStandard.mValue,
					heightStandard.lValue,
					heightStandard.sValue
				);
			}
		}

		if (input.headCircumference) {
			const hcStandard = await getWHOStandard(ageInDays, gender, "HcFA");
			if (hcStandard) {
				hcForAgeZ = calculateZScore(
					input.headCircumference,
					hcStandard.mValue,
					hcStandard.lValue,
					hcStandard.sValue
				);
			}
		}

		// Calculate BMI if both weight and height are provided
		if (input.weight && input.height) {
			const heightInMeters = input.height / 100;
			bmiForAgeZ = input.weight / (heightInMeters * heightInMeters);

			const bmiStandard = await getWHOStandard(ageInDays, gender, "BMI");
			if (bmiStandard) {
				bmiForAgeZ = calculateZScore(bmiForAgeZ, bmiStandard.mValue, bmiStandard.lValue, bmiStandard.sValue);
			}
		}

		const [record] = await db
			.insert(growthRecord)
			.values({
				id: crypto.randomUUID(),
				clinicId: context.clinicId,
				patientId: input.patientId,
				gender: patientData.gender,
				ageDays: ageInDays,
				ageMonths: ageInMonths,
				date: input.date,
				recordedAt: new Date(),
				weight: input.weight,
				height: input.height,
				headCircumference: input.headCircumference,
				weightForAgeZ,
				heightForAgeZ,
				hcForAgeZ,
				bmiForAgeZ,
				notes: input.notes,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return record;
	});

// Get growth chart data
export const getGrowthChart = clinicProcedure
	.input(
		z.object({
			patientId: z.string(),
			measurementType: z.enum(["WEIGHT", "HEIGHT", "BMI", "HEAD_CIRCUMFERENCE"]),
			fromDate: z.date().optional(),
			toDate: z.date().optional()
		})
	)
	.handler(async ({ input, context }) => {
		let whereClause = and(eq(growthRecord.patientId, input.patientId), eq(growthRecord.clinicId, context.clinicId));

		if (input.fromDate && input.toDate) {
			whereClause = and(whereClause, between(growthRecord.date, input.fromDate, input.toDate));
		}

		const records = await db.query.growthRecord.findMany({
			where: whereClause,
			orderBy: (growthRecord, { asc }) => [asc(growthRecord.date)]
		});

		const chartData = records.map(record => ({
			date: record.date,
			weight: input.measurementType === "WEIGHT" ? record.weight : null,
			height: input.measurementType === "HEIGHT" ? record.height : null,
			headCircumference: input.measurementType === "HEAD_CIRCUMFERENCE" ? record.headCircumference : null,
			id: record.id,
			value: getMeasurementValue(record, input.measurementType),
			zScore: getZScoreValue(record, input.measurementType),
			ageDays: record.ageDays,
			ageMonths: record.ageMonths
		}));

		return chartData;
	});

// Update growth measurement
export const updateGrowthMeasurement = clinicProcedure
	.input(
		z.object({
			id: z.string(),
			date: z.date().optional(),
			weight: z.number().optional(),
			height: z.number().optional(),
			headCircumference: z.number().optional(),
			notes: z.string().optional()
		})
	)
	.handler(async ({ input, context }) => {
		const existing = await db.query.growthRecord.findFirst({
			where: and(eq(growthRecord.id, input.id), eq(growthRecord.clinicId, context.clinicId))
		});

		if (!existing) throw new Error("Growth record not found");

		const patientData = await db.query.patient.findFirst({
			where: eq(patient.id, existing.patientId)
		});

		if (!patientData) throw new Error("Patient not found");

		const recordDate = input.date || existing.date;
		const ageInMonths = calculateAgeInMonths(patientData.dateOfBirth, recordDate);
		const ageInDays = calculateAgeInDays(patientData.dateOfBirth, recordDate);

		const gender = patientData.gender || existing.gender;

		let weightForAgeZ = existing.weightForAgeZ;
		let heightForAgeZ = existing.heightForAgeZ;
		let hcForAgeZ = existing.hcForAgeZ;
		let bmiForAgeZ = existing.bmiForAgeZ;

		const weight = input.weight ?? existing.weight;
		const height = input.height ?? existing.height;
		const headCircumference = input.headCircumference ?? existing.headCircumference;

		if (weight && gender) {
			const weightStandard = await getWHOStandard(ageInDays, gender, "WFA");
			if (weightStandard) {
				weightForAgeZ = calculateZScore(
					weight,
					weightStandard.mValue,
					weightStandard.lValue,
					weightStandard.sValue
				);
			}
		}

		if (height && gender) {
			const heightStandard = await getWHOStandard(ageInDays, gender, "HFA");
			if (heightStandard) {
				heightForAgeZ = calculateZScore(
					height,
					heightStandard.mValue,
					heightStandard.lValue,
					heightStandard.sValue
				);
			}
		}

		if (headCircumference && gender) {
			const hcStandard = await getWHOStandard(ageInDays, gender, "HcFA");
			if (hcStandard) {
				hcForAgeZ = calculateZScore(headCircumference, hcStandard.mValue, hcStandard.lValue, hcStandard.sValue);
			}
		}

		if (weight && height && gender) {
			const heightInMeters = height / 100;
			const bmi = weight / (heightInMeters * heightInMeters);
			const bmiStandard = await getWHOStandard(ageInDays, gender, "BMI");
			if (bmiStandard) {
				bmiForAgeZ = calculateZScore(bmi, bmiStandard.mValue, bmiStandard.lValue, bmiStandard.sValue);
			}
		}

		const [updated] = await db
			.update(growthRecord)
			.set({
				date: recordDate,
				ageDays: ageInDays,
				ageMonths: ageInMonths,
				weight,
				height,
				headCircumference,
				weightForAgeZ,
				heightForAgeZ,
				hcForAgeZ,
				bmiForAgeZ,
				notes: input.notes ?? existing.notes,
				updatedAt: new Date()
			})
			.where(and(eq(growthRecord.id, input.id), eq(growthRecord.clinicId, context.clinicId)))
			.returning();

		return updated;
	});

// Delete growth measurement
export const deleteGrowthMeasurement = clinicProcedure
	.input(
		z.object({
			id: z.string()
		})
	)
	.handler(async ({ input, context }) => {
		const [deleted] = await db
			.delete(growthRecord)
			.where(and(eq(growthRecord.id, input.id), eq(growthRecord.clinicId, context.clinicId)))
			.returning();

		if (!deleted) throw new Error("Growth record not found");

		return { success: true, id: deleted.id };
	});

// Get growth percentile classification
export const getGrowthPercentile = clinicProcedure
	.input(
		z.object({
			patientId: z.string(),
			date: z.date().optional()
		})
	)
	.handler(async ({ input, context }) => {
		const patientData = await db.query.patient.findFirst({
			where: eq(patient.id, input.patientId)
		});

		if (!patientData) throw new Error("Patient not found");

		const referenceDate = input.date || new Date();
		const ageDays = calculateAgeInDays(patientData.dateOfBirth, referenceDate);
		const ageMonths = calculateAgeInMonths(patientData.dateOfBirth, referenceDate);

		const latestRecord = await db.query.growthRecord.findFirst({
			where: and(eq(growthRecord.patientId, input.patientId), eq(growthRecord.clinicId, context.clinicId)),
			orderBy: (growthRecord, { desc }) => [desc(growthRecord.date)]
		});

		if (!latestRecord) {
			return {
				ageDays,
				ageMonths,
				classifications: null
			};
		}

		const getClassification = (zScore: number | null): string => {
			if (zScore === null) return "NO_DATA";
			if (zScore < -3) return "SEVERELY_UNDERWEIGHT";
			if (zScore < -2) return "UNDERWEIGHT";
			if (zScore <= 1) return "NORMAL";
			if (zScore <= 2) return "OVERWEIGHT";
			return "OBESE";
		};

		const getStuntingClassification = (zScore: number | null): string => {
			if (zScore === null) return "NO_DATA";
			if (zScore < -3) return "SEVERELY_STUNTED";
			if (zScore < -2) return "STUNTED";
			if (zScore <= 1) return "NORMAL";
			if (zScore <= 2) return "TALL";
			return "VERY_TALL";
		};

		return {
			ageDays,
			ageMonths,
			classifications: {
				weight: {
					zScore: latestRecord.weightForAgeZ,
					classification: getClassification(latestRecord.weightForAgeZ)
				},
				height: {
					zScore: latestRecord.heightForAgeZ,
					classification: getStuntingClassification(latestRecord.heightForAgeZ)
				},
				headCircumference: {
					zScore: latestRecord.hcForAgeZ,
					classification: getClassification(latestRecord.hcForAgeZ)
				},
				bmi: {
					zScore: latestRecord.bmiForAgeZ,
					classification: getClassification(latestRecord.bmiForAgeZ)
				}
			},
			lastMeasurement: latestRecord
		};
	});
