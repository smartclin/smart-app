// routers/vital-signs.router.ts

import type {} from "better-auth";
import { startOfDay, subDays } from "date-fns";
import { and, between, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { checkVitalSignsAccess } from "../../db/queries";
import { diagnosis, doctor, medicalRecord, patient, vitalSign } from "../../db/schema";
import { clinicProcedure, protectedProcedure } from "../init";

// ============================================
// Schemas
// ============================================

const CreateVitalSignsSchema = z.object({
	patientId: z.string(),
	medicalId: z.string(),
	encounterId: z.string().optional(),
	recordedAt: z.date().default(() => new Date()),
	bodyTemperature: z.number().optional(),
	systolic: z.number().optional(),
	diastolic: z.number().optional(),
	heartRate: z.number().optional(),
	respiratoryRate: z.number().optional(),
	oxygenSaturation: z.number().optional(),
	gender: z.string().optional(),
	notes: z.string().optional()
});

const UpdateVitalSignsSchema = CreateVitalSignsSchema.partial().extend({
	id: z.string()
});

const ListVitalSignsSchema = z.object({
	patientId: z.string(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(20),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	encounterId: z.string().optional()
});

const VitalSignsTrendSchema = z.object({
	patientId: z.string(),
	days: z.number().int().min(1).max(365).default(30),
	metrics: z
		.array(z.enum(["temperature", "bloodPressure", "heartRate", "oxygen"]))
		.default(["temperature", "heartRate", "oxygen"])
});

// ============================================
// Vital Signs Procedures
// ============================================

export const createVitalSigns = protectedProcedure.input(CreateVitalSignsSchema).handler(async ({ context, input }) => {
	const { clinicId, db } = context;

	if (!clinicId) {
		throw new Error("Clinic context missing");
	}

	console.info("Recording vital signs", {
		patientId: input.patientId,
		medicalId: input.medicalId
	});

	// Verify medical record exists
	const medicalRecordExists = await db.query.medicalRecord.findFirst({
		where: and(
			eq(medicalRecord.id, input.medicalId),
			eq(medicalRecord.clinicId, clinicId),
			eq(medicalRecord.isDeleted, false)
		)
	});

	if (!medicalRecordExists) {
		throw new Error("Medical record not found");
	}

	// Verify patient exists
	const patientData = await db.query.patient.findFirst({
		where: and(eq(patient.id, input.patientId), eq(patient.clinicId, clinicId), eq(patient.isDeleted, false))
	});

	if (!patientData) {
		throw new Error("Patient not found");
	}

	// Check if vital signs already exist for this medical record
	const existing = await db.query.vitalSign.findFirst({
		where: and(eq(vitalSign.medicalId, input.medicalId), eq(vitalSign.clinicId, clinicId))
	});

	if (existing) {
		throw new Error("Vital signs already recorded for this medical record");
	}

	// Calculate age
	const today = new Date();
	const ageDays = Math.floor((today.getTime() - patientData.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));
	const ageMonths = Math.floor(ageDays / 30.44);

	const [vitalSignsRecord] = await db
		.insert(vitalSign)
		.values({
			id: crypto.randomUUID(),
			clinicId: clinicId ?? "",
			patientId: input.patientId,
			medicalId: input.medicalId,
			encounterId: input.encounterId,
			recordedAt: input.recordedAt,
			bodyTemperature: input.bodyTemperature,
			systolic: input.systolic,
			diastolic: input.diastolic,
			heartRate: input.heartRate,
			respiratoryRate: input.respiratoryRate,
			oxygenSaturation: input.oxygenSaturation,
			gender: input.gender ?? patientData.gender,
			notes: input.notes,
			ageDays,
			ageMonths,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	// Update medical record with vital signs reference
	await db.update(medicalRecord).set({ updatedAt: new Date() }).where(eq(medicalRecord.id, input.medicalId));

	console.info("Vital signs recorded successfully", { vitalSignsId: vitalSignsRecord.id });

	// Fetch the complete record with relations
	const completeRecord = await db.query.vitalSign.findFirst({
		where: eq(vitalSign.id, vitalSignsRecord.id),
		with: {
			patient: {
				with: {
					user: {
						columns: {
							name: true,
							email: true
						}
					}
				}
			},
			medical: true,
			encounter: true
		}
	});

	return completeRecord;
});

export const getPatientHistory = protectedProcedure
	.input(z.object({ patientId: z.string() }))
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { patientId } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		const [history, chartData] = await Promise.all([
			db.query.vitalSign.findMany({
				where: and(eq(vitalSign.patientId, patientId), eq(vitalSign.clinicId, clinicId)),
				with: {
					medical: {
						columns: {
							id: true,
							createdAt: true
						}
					},
					encounter: {
						columns: {
							id: true,
							diagnosis: true
						}
					}
				},
				orderBy: [desc(vitalSign.recordedAt)]
			}),
			db.query.vitalSign.findMany({
				where: and(eq(vitalSign.patientId, patientId), eq(vitalSign.clinicId, clinicId)),
				orderBy: [vitalSign.recordedAt],
				limit: 50
			})
		]);

		return { history, chartData };
	});

export const updateVitalSigns = protectedProcedure.input(UpdateVitalSignsSchema).handler(async ({ context, input }) => {
	const { clinicId, db } = context;
	const { id, ...updateData } = input;

	if (!clinicId) throw new Error("Clinic context missing");

	console.info("Updating vital signs", { vitalSignsId: id });

	const existing = await db.query.vitalSign.findFirst({
		where: and(eq(vitalSign.id, id), eq(vitalSign.clinicId, clinicId))
	});

	if (!existing) {
		throw new Error("Vital signs not found");
	}

	const [updated] = await db
		.update(vitalSign)
		.set({
			...updateData,
			updatedAt: new Date()
		})
		.where(eq(vitalSign.id, id))
		.returning();

	console.info("Vital signs updated", { vitalSignsId: id });
	return updated;
});

export const getVitalSignsById = protectedProcedure
	.input(z.object({ id: z.string() }))
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { id } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		const vitalSignsRecord = await db.query.vitalSign.findFirst({
			where: and(eq(vitalSign.id, id), eq(vitalSign.clinicId, clinicId)),
			with: {
				patient: {
					with: {
						user: {
							columns: {
								name: true,
								email: true
							}
						}
					}
				},
				medical: {
					with: {
						doctor: {
							with: {
								user: {
									columns: {
										name: true
									}
								}
							}
						},
						prescriptions: {
							limit: 3
						}
					}
				},
				encounter: true
			}
		});

		if (!vitalSignsRecord) {
			throw new Error("Vital signs not found");
		}

		console.debug("Retrieved vital signs", { vitalSignsId: id });
		return vitalSignsRecord;
	});

export const listVitalSignsByPatient = protectedProcedure
	.input(ListVitalSignsSchema)
	.handler(async ({ context, input }) => {
		const { clinicId, db, user } = context;
		const { patientId, page, pageSize, fromDate, toDate, encounterId } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		console.debug("Listing vital signs", { patientId, page, pageSize });

		// Check access permissions
		const hasAccess = await checkVitalSignsAccess(user?.id ?? "", patientId);
		if (!hasAccess && user?.role !== "admin" && user?.role !== "staff") {
			throw new Error("You don't have access to this patient's vital signs");
		}

		const conditions = and(
			eq(vitalSign.clinicId, clinicId ?? ""),
			eq(vitalSign.patientId, patientId),
			fromDate && toDate ? between(vitalSign.recordedAt, fromDate, toDate) : undefined,
			encounterId ? eq(vitalSign.encounterId, encounterId) : undefined
		);

		// Fetch vital signs

		const vitalSignsList = await db.query.vitalSign.findMany({
			where: conditions,
			with: {
				medical: {
					columns: {
						id: true,
						createdAt: true
					}
				},
				encounter: {
					columns: {
						id: true,
						diagnosis: true
					}
				}
			},
			limit: pageSize,
			offset: (page - 1) * pageSize,
			orderBy: [desc(vitalSign.recordedAt)]
		});

		const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(vitalSign).where(conditions);

		const total = totalResult?.count ?? 0;

		return {
			vitalSigns: vitalSignsList,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	});

export const getLatestVitalSigns = protectedProcedure
	.input(z.object({ patientId: z.string(), limit: z.number().default(1) }))
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { patientId, limit } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		const latestVitalSigns = await db.query.vitalSign.findMany({
			where: and(eq(vitalSign.clinicId, clinicId), eq(vitalSign.patientId, patientId)),
			limit,
			orderBy: [desc(vitalSign.recordedAt)]
		});

		return latestVitalSigns ?? null;
	});

export const getVitalSignsTrend = protectedProcedure
	.input(VitalSignsTrendSchema)
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { patientId, days, metrics } = input;

		const startDate = startOfDay(subDays(new Date(), days));

		if (!clinicId) throw new Error("Clinic context missing");

		console.debug("Getting vital signs trend", { patientId, days, metrics });

		const vitalSignsList = await db.query.vitalSign.findMany({
			where: and(
				eq(vitalSign.clinicId, clinicId),
				eq(vitalSign.patientId, patientId),
				gte(vitalSign.recordedAt, startDate)
			),
			orderBy: [vitalSign.recordedAt]
		});

		const trend: {
			dates: string[];
			temperature: Array<{ value: number; date: string }>;
			bloodPressure: Array<{ systolic: number; diastolic: number; date: string }>;
			heartRate: Array<{ value: number; date: string }>;
			oxygen: Array<{ value: number; date: string }>;
		} = {
			dates: [],
			temperature: [],
			bloodPressure: [],
			heartRate: [],
			oxygen: []
		};

		vitalSignsList.forEach(vs => {
			const date = vs.recordedAt.toISOString();
			trend.dates.push(date);

			if (metrics.includes("temperature") && vs.bodyTemperature) {
				trend.temperature.push({ value: vs.bodyTemperature, date });
			}

			if (metrics.includes("bloodPressure") && vs.systolic && vs.diastolic) {
				trend.bloodPressure.push({ systolic: vs.systolic, diastolic: vs.diastolic, date });
			}

			if (metrics.includes("heartRate") && vs.heartRate) {
				trend.heartRate.push({ value: vs.heartRate, date });
			}

			if (metrics.includes("oxygen") && vs.oxygenSaturation) {
				trend.oxygen.push({ value: vs.oxygenSaturation, date });
			}
		});

		// Calculate summary statistics
		const summary = {
			temperature: calculateSummary(trend.temperature.map(t => t.value)),
			heartRate: calculateSummary(trend.heartRate.map(h => h.value)),
			oxygenSaturation: calculateSummary(trend.oxygen.map(o => o.value))
		};

		return {
			patientId,
			period: { days, startDate, endDate: new Date() },
			trend,
			summary,
			totalReadings: vitalSignsList.length
		};
	});

export const deleteVitalSigns = protectedProcedure
	.input(z.object({ id: z.string(), reason: z.string().optional() }))
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { id, reason } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		console.warn("Deleting vital signs", { vitalSignsId: id, reason });

		const existing = await db.query.vitalSign.findFirst({
			where: and(eq(vitalSign.id, id), eq(vitalSign.clinicId, clinicId)),
			with: {
				patient: {
					with: {
						user: true
					}
				}
			}
		});

		if (!existing) {
			throw new Error("Vital signs not found");
		}

		await db.delete(vitalSign).where(eq(vitalSign.id, id));

		return { success: true, message: "Vital signs deleted successfully" };
	});

// ============================================
// Diagnosis Procedures
// ============================================

const CreateDiagnosisFullSchema = z.object({
	patientId: z.string(),
	doctorId: z.string(),
	appointmentId: z.string().optional(),
	medicalId: z.string(),
	date: z.coerce.date().default(() => new Date()),
	type: z.string().optional(),
	diagnosis: z.string(),
	treatment: z.string().optional(),
	notes: z.string().optional(),
	symptoms: z.string().optional(),
	prescribedMedications: z.string().optional(),
	followUpPlan: z.string().optional(),
	status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING"),
	typeOfEncounter: z
		.enum(["CONSULTATION", "VACCINATION", "SCREENING", "FOLLOW_UP", "NUTRITION", "NEWBORN", "LACTATION", "OTHER"])
		.default("CONSULTATION")
});

const UpdateDiagnosisFullSchema = CreateDiagnosisFullSchema.partial().extend({
	id: z.string()
});

const ListDiagnosesFullSchema = z.object({
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(20),
	fromDate: z.coerce.date().optional(),
	toDate: z.coerce.date().optional(),
	status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
	typeOfEncounter: z
		.enum(["CONSULTATION", "VACCINATION", "SCREENING", "FOLLOW_UP", "NUTRITION", "NEWBORN", "LACTATION", "OTHER"])
		.optional(),
	search: z.string().optional()
});

export const diagnosisProcedure = clinicProcedure;

export const createDiagnosis = diagnosisProcedure
	.input(CreateDiagnosisFullSchema)
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;

		if (!clinicId) {
			throw new Error("Clinic context missing");
		}

		console.info("Creating diagnosis", {
			patientId: input.patientId,
			doctorId: input.doctorId,
			diagnosis: input.diagnosis
		});

		// Verify medical record exists
		const medicalRecordExists = await db.query.medicalRecord.findFirst({
			where: and(
				eq(medicalRecord.id, input.medicalId),
				eq(medicalRecord.clinicId, clinicId),
				eq(medicalRecord.isDeleted, false)
			)
		});

		if (!medicalRecordExists) {
			throw new Error("Medical record not found");
		}

		// Verify patient exists
		const patientData = await db.query.patient.findFirst({
			where: and(eq(patient.id, input.patientId), eq(patient.clinicId, clinicId), eq(patient.isDeleted, false))
		});

		if (!patientData) {
			throw new Error("Patient not found");
		}

		// Verify doctor exists
		const doctorData = await db.query.doctor.findFirst({
			where: and(eq(doctor.id, input.doctorId), eq(doctor.clinicId, clinicId), eq(doctor.isDeleted, false))
		});

		if (!doctorData) {
			throw new Error("Doctor not found");
		}

		// Check if diagnosis already exists for this medical record
		const existing = await db.query.diagnosis.findFirst({
			where: and(
				eq(diagnosis.medicalId, input.medicalId),
				eq(diagnosis.clinicId, clinicId),
				eq(diagnosis.isDeleted, false)
			)
		});

		if (existing) {
			throw new Error("Diagnosis already exists for this medical record");
		}

		const [diagnosisRecord] = await db
			.insert(diagnosis)
			.values({
				id: crypto.randomUUID(),
				clinicId,
				patientId: input.patientId,
				doctorId: input.doctorId,
				appointmentId: input.appointmentId,
				medicalId: input.medicalId,
				date: input.date,
				type: input.type ?? input.typeOfEncounter,
				diagnosis: input.diagnosis,
				treatment: input.treatment,
				notes: input.notes,
				symptoms: input.symptoms ?? "",
				prescribedMedications: input.prescribedMedications,
				followUpPlan: input.followUpPlan,
				status: input.status,
				// Removed direct typeOfEncounter insert as it's not in the DB schema
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Update medical record with diagnosis reference
		await db.update(medicalRecord).set({ updatedAt: new Date() }).where(eq(medicalRecord.id, input.medicalId));

		// Update appointment status if appointment exists
		if (input.appointmentId) {
			await db
				.update(medicalRecord) // Assuming appointment updates through medical record
				.set({ updatedAt: new Date() })
				.where(eq(medicalRecord.id, input.medicalId));
		}

		console.info("Diagnosis created successfully", { diagnosisId: diagnosisRecord.id });

		// Fetch complete record with relations
		const completeRecord = await db.query.diagnosis.findFirst({
			where: eq(diagnosis.id, diagnosisRecord.id),
			with: {
				patient: {
					with: {
						user: {
							columns: {
								name: true,
								email: true
							}
						}
					}
				},
				doctor: {
					with: {
						user: {
							columns: {
								name: true,
								email: true
							}
						}
					}
				},
				appointment: true,
				medical: true,
				vitalSigns: true
			}
		});

		return completeRecord;
	});

export const updateDiagnosis = diagnosisProcedure
	.input(UpdateDiagnosisFullSchema)
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { id, ...updateData } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		console.info("Updating diagnosis", { diagnosisId: id });

		const existing = await db.query.diagnosis.findFirst({
			where: and(eq(diagnosis.id, id), eq(diagnosis.clinicId, clinicId), eq(diagnosis.isDeleted, false))
		});

		if (!existing) {
			throw new Error("Diagnosis not found");
		}

		const [updated] = await db
			.update(diagnosis)
			.set({
				...updateData,
				updatedAt: new Date()
			})
			.where(eq(diagnosis.id, id))
			.returning();

		console.info("Diagnosis updated", { diagnosisId: id });
		return updated;
	});

export const getDiagnosisById = diagnosisProcedure
	.input(z.object({ id: z.string() }))
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { id } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		const diagnosisRecord = await db.query.diagnosis.findFirst({
			where: and(eq(diagnosis.id, id), eq(diagnosis.clinicId, clinicId), eq(diagnosis.isDeleted, false)),
			with: {
				patient: {
					with: {
						user: {
							columns: {
								name: true,
								email: true
							}
						}
					}
				},
				doctor: {
					with: {
						user: {
							columns: {
								name: true,
								email: true
							}
						}
					}
				},
				appointment: true,
				medical: {
					with: {
						vitalSigns: true,
						immunizations: true
					}
				},
				vitalSigns: true
			}
		});

		if (!diagnosisRecord) {
			throw new Error("Diagnosis not found");
		}

		console.debug("Retrieved diagnosis", { diagnosisId: id });
		return diagnosisRecord;
	});

export const listDiagnoses = diagnosisProcedure.input(ListDiagnosesFullSchema).handler(async ({ context, input }) => {
	const { clinicId, db, user } = context;
	const { patientId, doctorId, page, pageSize, fromDate, toDate, status, typeOfEncounter, search } = input;

	if (!clinicId) throw new Error("Clinic context missing");

	console.debug("Listing diagnoses", { patientId, doctorId, page, pageSize });

	let conditions = and(
		eq(diagnosis.clinicId, clinicId),
		eq(diagnosis.isDeleted, false),
		patientId ? eq(diagnosis.patientId, patientId) : undefined,
		doctorId ? eq(diagnosis.doctorId, doctorId) : undefined,
		fromDate && toDate ? between(diagnosis.date, fromDate, toDate) : undefined,
		status ? eq(diagnosis.status, status) : undefined,
		typeOfEncounter ? eq(diagnosis.type, typeOfEncounter) : undefined
	);

	// Role-based filtering
	if (user?.role === "patient") {
		const patientData = await db.query.patient.findFirst({
			where: eq(patient.userId, user.id)
		});
		if (patientData) {
			conditions = and(conditions, eq(diagnosis.patientId, patientData.id));
		}
	} else if (user?.role === "doctor") {
		const doctorData = await db.query.doctor.findFirst({
			where: eq(doctor.userId, user.id)
		});
		if (doctorData) {
			conditions = and(conditions, eq(diagnosis.doctorId, doctorData.id));
		}
	}

	let diagnosesList = await db.query.diagnosis.findMany({
		where: conditions,
		with: {
			patient: {
				with: {
					user: {
						columns: {
							name: true
						}
					}
				}
			},
			doctor: {
				with: {
					user: {
						columns: {
							name: true
						}
					}
				}
			},
			appointment: true,
			medical: true,
			vitalSigns: true
		},
		limit: pageSize,
		offset: (page - 1) * pageSize,
		orderBy: [desc(diagnosis.date)]
	});

	// Apply search filter
	if (search) {
		const searchLower = search.toLowerCase();
		diagnosesList = diagnosesList.filter(
			d =>
				d.diagnosis?.toLowerCase().includes(searchLower) ||
				d.treatment?.toLowerCase().includes(searchLower) ||
				d.symptoms?.toLowerCase().includes(searchLower)
		);
	}

	const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(diagnosis).where(conditions);

	const total = totalResult?.count ?? 0;

	return {
		diagnoses: diagnosesList,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize)
		}
	};
});

export const deleteDiagnosis = clinicProcedure
	.input(z.object({ id: z.string(), reason: z.string().optional() }))
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { id, reason } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		console.warn("Soft deleting diagnosis", { diagnosisId: id, reason });

		const existing = await db.query.diagnosis.findFirst({
			where: and(eq(diagnosis.id, id), eq(diagnosis.clinicId, clinicId), eq(diagnosis.isDeleted, false))
		});

		if (!existing) {
			throw new Error("Diagnosis not found");
		}

		await db
			.update(diagnosis)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(diagnosis.id, id));

		// auditLog insert commented out because table is not defined in the schema context

		return { success: true, message: "Diagnosis deleted successfully" };
	});

export const getDiagnosisStatistics = protectedProcedure
	.input(
		z.object({
			startDate: z.coerce.date(),
			endDate: z.coerce.date(),
			groupBy: z.enum(["doctor", "type", "status"]).default("doctor")
		})
	)
	.handler(async ({ context, input }) => {
		const { clinicId, db } = context;
		const { startDate, endDate, groupBy } = input;

		if (!clinicId) throw new Error("Clinic context missing");

		console.info("Generating diagnosis statistics", { startDate, endDate, groupBy });

		const whereConditions = and(
			eq(diagnosis.clinicId, clinicId),
			eq(diagnosis.isDeleted, false),
			between(diagnosis.date, startDate, endDate)
		);

		const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(diagnosis).where(whereConditions);

		const byType = await db
			.select({
				type: diagnosis.type,
				count: sql<number>`count(*)`
			})
			.from(diagnosis)
			.where(whereConditions)
			.groupBy(diagnosis.type);

		const byStatus = await db
			.select({
				status: diagnosis.status,
				count: sql<number>`count(*)`
			})
			.from(diagnosis)
			.where(whereConditions)
			.groupBy(diagnosis.status);

		const byDoctor = await db
			.select({
				doctorId: diagnosis.doctorId,
				count: sql<number>`count(*)`
			})
			.from(diagnosis)
			.where(whereConditions)
			.groupBy(diagnosis.doctorId)
			.orderBy(sql`count(*) DESC`)
			.limit(10);

		// Get doctor names for the top doctors
		const doctorIds = byDoctor.map(d => d.doctorId).filter(Boolean);
		const doctorsList =
			doctorIds.length > 0
				? await db.query.doctor.findMany({
						where: and(eq(doctor.clinicId, clinicId), inArray(doctor.id, doctorIds as string[])),
						with: {
							user: {
								columns: {
									name: true
								}
							}
						}
					})
				: [];

		const doctorMap = new Map(doctorsList.map(d => [d.id, d.user?.name || d.name]));

		const statistics = {
			period: { startDate, endDate },
			total: totalResult?.count ?? 0,
			distribution: {
				byType: byType.map(t => ({ type: t.type, count: Number(t.count) })),
				byStatus: byStatus.map(s => ({ status: s.status, count: Number(s.count) }))
			},
			topDoctors: byDoctor.map(d => ({
				doctorId: d.doctorId,
				doctorName: doctorMap.get(d.doctorId) || "Unknown",
				count: Number(d.count)
			}))
		};

		console.info("Diagnosis statistics generated", statistics);
		return statistics;
	});

// ============================================
// Helper Functions
// ============================================

function calculateSummary(values: number[]): {
	min: number | null;
	max: number | null;
	avg: number | null;
	latest: number | null;
} {
	if (values.length === 0) {
		return { min: null, max: null, avg: null, latest: null };
	}
	return {
		min: Math.min(...values),
		max: Math.max(...values),
		avg: values.reduce((a, b) => a + b, 0) / values.length,
		latest: values[values.length - 1]
	};
}
