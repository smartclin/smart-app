// src/mcp/mcp-medical.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { generateId } from "#/lib/id";
import { orpc } from "#/orpc/client";

// Pediatric-specific specialties
const PEDIATRIC_SPECIALTIES = [
	"General Pediatrics",
	"Pediatric Cardiology",
	"Pediatric Neurology",
	"Pediatric Pulmonology",
	"Pediatric Gastroenterology",
	"Pediatric Endocrinology",
	"Pediatric Hematology",
	"Pediatric Infectious Diseases",
	"Neonatology",
	"Pediatric Emergency Medicine",
	"Pediatric Intensive Care",
	"Developmental Pediatrics",
	"Pediatric Allergy",
	"Pediatric Rheumatology"
] as const;

// Pediatric-specific appointment types
const APPOINTMENT_TYPES = [
	"Well-Child Visit",
	"Sick Visit",
	"Vaccination",
	"Follow-up",
	"Emergency",
	"Developmental Check",
	"Growth Monitoring",
	"Nutritional Counseling",
	"Behavioral Assessment",
	"School Physical"
] as const;

// Create MCP Server for pediatric medical operations
export const pediatricMcpServer = new McpServer({
	name: "pediatric-clinic-server",
	version: "1.0.0"
});

// ================ HELPER FUNCTIONS ================

function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}

function calculateAge(dateOfBirth: Date | string): string {
	const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
	const today = new Date();
	let years = today.getFullYear() - dob.getFullYear();
	let months = today.getMonth() - dob.getMonth();
	let days = today.getDate() - dob.getDate();

	if (days < 0) {
		months--;
		days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
	}
	if (months < 0) {
		years--;
		months += 12;
	}

	if (years > 0) return `${years}y ${months}m`;
	if (months > 0) return `${months}m ${days}d`;
	return `${days}d`;
}

// ================ DOCTOR TOOLS ================

pediatricMcpServer.registerTool(
	"listPediatricians",
	{
		title: "List Pediatric Doctors",
		description: "Get a list of pediatric doctors with optional filters",
		inputSchema: {
			clinicId: z.string().optional().describe("Filter by clinic ID"),
			specialty: z.enum(PEDIATRIC_SPECIALTIES).optional().describe("Filter by pediatric specialty"),
			isActive: z.boolean().optional().describe("Filter by active status"),
			search: z.string().optional().describe("Search by name or specialty"),
			limit: z.number().default(20).describe("Number of results per page"),
			offset: z.number().default(0).describe("Pagination offset")
		}
	},
	async ({ clinicId, specialty, isActive, search, limit, offset }) => {
		try {
			const result = await orpc.doctors.list.call({
				clinicId,
				specialty,
				isActive,
				search,
				limit,
				offset
			});
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								doctors: result.doctors,
								total: result.total,
								totalPages: result.totalPages,
								message: `Found ${result.doctors.length} pediatric doctors`
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ error: "Failed to fetch doctors", details: String(error) }, null, 2)
					}
				]
			};
		}
	}
);

pediatricMcpServer.registerTool(
	"getDoctorById",
	{
		title: "Get Doctor Details",
		description: "Get detailed information about a specific doctor",
		inputSchema: {
			id: z.string().describe("Doctor ID")
		}
	},
	async ({ id }) => {
		try {
			const result = await orpc.doctors.get.call({ id });
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
			};
		} catch (error) {
			console.error(error);
			return {
				content: [{ type: "text", text: JSON.stringify({ error: "Doctor not found", id }, null, 2) }]
			};
		}
	}
);

// ================ PATIENT TOOLS (Pediatric-focused) ================

pediatricMcpServer.registerTool(
	"listPediatricPatients",
	{
		title: "List Pediatric Patients",
		description: "Get a list of pediatric patients (children under 18)",
		inputSchema: {
			clinicId: z.string().optional().describe("Filter by clinic ID"),
			search: z.string().optional().describe("Search by name, email, or phone"),
			status: z.string().optional().describe("Filter by status (ACTIVE/INACTIVE)"),
			ageRange: z
				.object({
					min: z.number().optional().describe("Minimum age in years"),
					max: z.number().optional().describe("Maximum age in years")
				})
				.optional()
				.describe("Filter by age range"),
			limit: z.number().default(20).describe("Number of results per page"),
			offset: z.number().default(0).describe("Pagination offset")
		}
	},
	async ({ search, status, ageRange, limit, offset }) => {
		try {
			const result = await orpc.patients.list.call({
				search,
				status,
				isActive: true,
				limit,
				offset
			});

			// Filter by age (pediatric patients are under 18)
			const pediatricPatients = result.patients.filter(patient => {
				const age = calculateAge(patient.dateOfBirth);
				const ageYears = Number.parseInt(age.split("y")[0] || "0", 10);
				if (ageRange) {
					return ageYears >= (ageRange.min || 0) && ageYears <= (ageRange.max || 18);
				}
				return ageYears < 18;
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								patients: pediatricPatients,
								total: pediatricPatients.length,
								message: `Found ${pediatricPatients.length} pediatric patients`
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ error: "Failed to fetch patients", details: String(error) }, null, 2)
					}
				]
			};
		}
	}
);

pediatricMcpServer.registerTool(
	"getPatientWithGrowthData",
	{
		title: "Get Patient with Growth Data",
		description: "Get detailed patient information including growth charts and developmental milestones",
		inputSchema: {
			id: z.string().describe("Patient ID")
		}
	},
	async ({ id }) => {
		try {
			const [patient, growthRecords, vitalSigns] = await Promise.all([
				orpc.patients.get.call({ id }),
				orpc.growth.getChart.call({
					patientId: id,
					measurementType: "WEIGHT"
				}),
				orpc.vitalSigns.getLatest.call({ patientId: id, limit: 10 })
			]);

			const age = patient ? calculateAge(patient.dateOfBirth) : "Unknown";

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								patient: {
									...patient,
									age,
									formattedDateOfBirth: patient ? formatDate(patient.dateOfBirth) : null
								},
								growthRecords: growthRecords || [],
								recentVitals: vitalSigns || [],
								summary: {
									weightAgeZScore: growthRecords?.[0]?.zScore,
									heightAgeZScore: growthRecords?.[0]?.zScore,
									lastCheckup: growthRecords?.[0]?.date ? formatDate(growthRecords[0].date) : null
								}
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ error: "Patient not found", id, details: String(error) }, null, 2)
					}
				]
			};
		}
	}
);

// ================ APPOINTMENT TOOLS (Pediatric-specific) ================

pediatricMcpServer.registerTool(
	"listPediatricAppointments",
	{
		title: "List Pediatric Appointments",
		description: "Get a list of pediatric appointments with optional filters",
		inputSchema: {
			status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "PENDING", "NO_SHOW"]).optional(),
			type: z.enum(APPOINTMENT_TYPES).optional(),
			patientId: z.string().optional(),
			doctorId: z.string().optional(),
			dateRange: z
				.object({
					from: z.string().describe("Start date (YYYY-MM-DD)"),
					to: z.string().describe("End date (YYYY-MM-DD)")
				})
				.optional(),
			limit: z.number().default(20),
			offset: z.number().default(0)
		}
	},
	async ({ status, type, patientId, doctorId, dateRange, limit, offset }) => {
		try {
			const result = await orpc.appointments.list.call({
				status,
				type,
				patientId,
				doctorId,
				fromDate: dateRange?.from ? new Date(dateRange.from) : new Date(0),
				toDate: dateRange?.to ? new Date(dateRange.to) : new Date(),
				limit,
				offset
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								appointments: result.appointments,
								total: result.total,
								summary: {
									upcoming: result.appointments.filter(a => a.status === "SCHEDULED").length,
									completed: result.appointments.filter(a => a.status === "COMPLETED").length,
									cancelled: result.appointments.filter(a => a.status === "CANCELLED").length
								}
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ error: "Failed to fetch appointments", details: String(error) }, null, 2)
					}
				]
			};
		}
	}
);

pediatricMcpServer.registerTool(
	"scheduleWellChildVisit",
	{
		title: "Schedule Well-Child Visit",
		description: "Schedule a well-child checkup appointment with recommended age-based screenings",
		inputSchema: {
			patientId: z.string().describe("Patient ID"),
			doctorId: z.string().describe("Doctor ID"),
			clinicId: z.string().describe("Clinic ID"),
			appointmentDate: z.string().describe("Appointment date (YYYY-MM-DD)"),
			time: z.string().optional().describe("Appointment time (HH:MM)"),
			visitType: z
				.enum([
					"Newborn",
					"1 Month",
					"2 Months",
					"4 Months",
					"6 Months",
					"9 Months",
					"12 Months",
					"15 Months",
					"18 Months",
					"2 Years",
					"2.5 Years",
					"3 Years",
					"4 Years",
					"5 Years"
				])
				.describe("Type of well-child visit"),
			reason: z.string().optional().describe("Additional reason for visit")
		}
	},
	async ({ patientId, doctorId, clinicId, appointmentDate, time, visitType, reason }) => {
		try {
			const result = await orpc.appointments.create.call({
				id: generateId("appointment"),
				patientId,
				doctorId,
				clinicId,
				appointmentDate: new Date(appointmentDate),
				time,
				durationMinutes: 30,
				type: "Well-Child Visit",
				reason:
					reason ||
					`${visitType} Well-Child Checkup - Includes growth monitoring, developmental screening, and vaccinations`,
				status: "SCHEDULED"
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								appointment: result,
								message: `Successfully scheduled ${visitType} well-child visit for ${formatDate(appointmentDate)}`,
								recommendedScreenings: getScreeningsByAge(visitType)
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{ error: "Failed to schedule appointment", details: String(error) },
							null,
							2
						)
					}
				]
			};
		}
	}
);

// Helper function for age-based screenings
function getScreeningsByAge(visitType: string): string[] {
	const screenings: Record<string, string[]> = {
		Newborn: ["Newborn metabolic screening", "Hearing screening", "Bilirubin check", "Newborn physical exam"],
		"1 Month": ["Growth assessment", "Feeding evaluation", "Jaundice check"],
		"2 Months": ["Hepatitis B vaccine", "DTaP vaccine", "Hib vaccine", "PCV13 vaccine", "Rotavirus vaccine"],
		"4 Months": ["DTaP vaccine", "Hib vaccine", "PCV13 vaccine", "Rotavirus vaccine"],
		"6 Months": [
			"DTaP vaccine",
			"Hib vaccine",
			"PCV13 vaccine",
			"Rotavirus vaccine",
			"Lead screening (if high risk)"
		],
		"9 Months": ["Developmental screening", "Anemia screening", "Lead screening"],
		"12 Months": ["MMR vaccine", "Varicella vaccine", "Hepatitis A vaccine", "TB test (if high risk)"],
		"15 Months": ["Developmental screening", "Lead screening", "Anemia screening"],
		"18 Months": ["Autism screening", "Developmental screening", "Lead screening"],
		"2 Years": ["Autism screening", "Lead screening", "Vision screening"],
		"2.5 Years": ["Developmental screening", "Speech/language assessment"],
		"3 Years": ["Annual physical", "Vision screening", "Hearing screening", "Blood pressure check"],
		"4 Years": ["Annual physical", "Vision screening", "Hearing screening", "Pre-K readiness"],
		"5 Years": [
			"Kindergarten readiness",
			"Vision screening",
			"Hearing screening",
			"DTaP/IPV/MMR/Varicella boosters"
		]
	};
	return screenings[visitType] || ["Routine physical exam", "Growth assessment", "Developmental screening"];
}

// ================ MEDICAL RECORD TOOLS ================

pediatricMcpServer.registerTool(
	"createPediatricEncounter",
	{
		title: "Create Pediatric Medical Encounter",
		description: "Create a complete pediatric medical encounter with growth measurements and vaccinations",
		inputSchema: {
			patientId: z.string().describe("Patient ID"),
			appointmentId: z.string().describe("Appointment ID"),
			doctorId: z.string().describe("Doctor ID"),
			symptoms: z.string().describe("Patient symptoms"),
			diagnosis: z.string().optional().describe("Medical diagnosis"),
			treatment: z.string().optional().describe("Treatment plan"),
			weight: z.number().optional().describe("Weight in kg"),
			height: z.number().optional().describe("Height in cm"),
			headCircumference: z.number().optional().describe("Head circumference in cm (for infants)"),
			bodyTemperature: z.number().optional().describe("Body temperature in Celsius"),
			heartRate: z.number().optional().describe("Heart rate (BPM)"),
			vaccinationsGiven: z.array(z.string()).optional().describe("List of vaccinations administered"),
			developmentalMilestones: z.array(z.string()).optional().describe("Developmental milestones achieved"),
			notes: z.string().optional().describe("Additional clinical notes")
		}
	},
	async ({
		patientId,
		appointmentId,
		doctorId,
		symptoms,
		diagnosis,
		treatment,
		weight,
		height,
		headCircumference,
		bodyTemperature,
		heartRate,
		vaccinationsGiven,
		developmentalMilestones,
		notes
	}) => {
		try {
			// Create the medical record with growth data
			const result = await orpc.medicalRecords.createCompleteEncounter.call({
				patientId,
				appointmentId,
				doctorId,
				diagnosis: {
					symptoms,
					diagnosis,
					treatment,
					prescribedMedications: treatment
				},
				vitals: {
					bodyTemperature,
					heartRate,
					notes
				},
				medicalRecord: {
					notes,
					treatmentPlan: treatment
				}
			});

			// If growth measurements provided, add growth record
			if (weight || height || headCircumference) {
				await orpc.growth.record.call({
					patientId,
					weight: weight || 0,
					height: height || 0,
					headCircumference: headCircumference || 0,
					date: new Date()
				});
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								encounter: result,
								summary: {
									diagnosis: diagnosis || "Not specified",
									treatment: treatment || "Not specified",
									measurements: {
										weight: weight ? `${weight} kg` : "Not recorded",
										height: height ? `${height} cm` : "Not recorded",
										headCircumference: headCircumference
											? `${headCircumference} cm`
											: "Not recorded"
									},
									vaccinationsGiven: vaccinationsGiven || [],
									developmentalMilestones: developmentalMilestones || []
								}
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{ error: "Failed to create medical encounter", details: String(error) },
							null,
							2
						)
					}
				]
			};
		}
	}
);

// ================ VACCINATION TOOLS ================

pediatricMcpServer.registerTool(
	"getVaccinationSchedule",
	{
		title: "Get Vaccination Schedule",
		description: "Get recommended vaccination schedule based on patient age",
		inputSchema: {
			patientId: z.string().describe("Patient ID"),
			includeHistory: z.boolean().default(true).describe("Include vaccination history")
		}
	},
	async ({ patientId, includeHistory }) => {
		try {
			const patient = await orpc.patients.get.call({ id: patientId });
			if (!patient) {
				throw new Error("Patient not found");
			}

			const age = calculateAge(patient.dateOfBirth);
			const ageMonths = Number.parseInt(age.split("m")[0] || "0", 10);
			const ageYears = Number.parseInt(age.split("y")[0] || "0", 10);

			let dueVaccines: string[] = [];

			// Simplified vaccine schedule based on age
			if (ageMonths < 2) dueVaccines = ["Hepatitis B (Birth dose)"];
			else if (ageMonths < 4) dueVaccines = ["DTaP-IPV-Hib", "PCV13", "Rotavirus"];
			else if (ageMonths < 6) dueVaccines = ["DTaP-IPV-Hib", "PCV13", "Rotavirus"];
			else if (ageMonths < 12) dueVaccines = ["DTaP-IPV-Hib", "PCV13", "Influenza (if in season)"];
			else if (ageMonths < 15) dueVaccines = ["MMR", "Varicella", "Hepatitis A"];
			else if (ageYears < 4) dueVaccines = ["DTaP-IPV", "MMR", "Varicella"];
			else if (ageYears < 6) dueVaccines = ["Kindergarten boosters: DTaP-IPV, MMR, Varicella"];
			else dueVaccines = ["Routine checkup - no vaccines due at this time"];

			const vaccinationHistory = includeHistory ? await orpc.immunizations.getSchedule.call({ patientId }) : null;

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								patientName: `${patient.firstName} ${patient.lastName}`,
								age,
								recommendedVaccinations: dueVaccines,
								vaccinationHistory: vaccinationHistory || [],
								nextWellChildVisit: getNextWellChildVisitAge(ageMonths, ageYears),
								message:
									"Please consult the full CDC immunization schedule for complete recommendations"
							},
							null,
							2
						)
					}
				]
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{ error: "Failed to get vaccination schedule", details: String(error) },
							null,
							2
						)
					}
				]
			};
		}
	}
);

function getNextWellChildVisitAge(ageMonths: number, ageYears: number): string {
	const schedule = [
		{ age: 0, name: "Newborn" },
		{ age: 1, name: "1 Month" },
		{ age: 2, name: "2 Months" },
		{ age: 4, name: "4 Months" },
		{ age: 6, name: "6 Months" },
		{ age: 9, name: "9 Months" },
		{ age: 12, name: "12 Months" },
		{ age: 15, name: "15 Months" },
		{ age: 18, name: "18 Months" },
		{ age: 24, name: "2 Years" },
		{ age: 30, name: "2.5 Years" },
		{ age: 36, name: "3 Years" },
		{ age: 48, name: "4 Years" },
		{ age: 60, name: "5 Years" }
	];

	let next = schedule.find(s => s.age > ageMonths);
	if (!next && ageYears < 6) next = { age: 60, name: "5 Years" };
	return next ? `${next.name} (${next.age} months)` : "Annual checkup";
}
