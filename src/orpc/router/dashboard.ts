// lib/orpc/dashboard-procedures.ts
import { and, asc, between, desc, eq, gte, lt, lte, ne, notInArray, sql } from "drizzle-orm";
import { z } from "zod";

import { calculatePatientSatisfaction, mapActionToActivity } from "#/utils";
import { toNumber } from "#/utils/decimal";

import {
	appointment,
	clinics,
	doctor,
	immunization,
	patient,
	payment,
	prescribedItem,
	prescription,
	service,
	staff
} from "../../db/schema";
import { protectedProcedure } from "../init";

// Dashboard stats response type
export interface DashboardStats {
	overview: {
		totalPatients: number;
		totalAppointments: number;
		activeDoctors: number;
		activeStaff: number;
		occupancyRate: number;
		pendingPrescriptionsCount: number;
		lowStockItemsCount: number;
	};
	today: {
		appointments: number;
		appointmentsList: Array<{
			id: string;
			time: string;
			patientName: string;
			doctorName: string;
			status: string;
		}>;
		revenue: number;
		completedAppointments: number;
		cancelledAppointments: number;
	};
	weekly: {
		appointmentsCount: number;
		appointmentsByDay: Array<{
			day: string;
			count: number;
			date: string;
		}>;
		newPatientsCount: number;
		revenue: number;
		topDoctors: Array<{
			id: string;
			name: string;
			appointmentCount: number;
			revenue: number;
		}>;
	};
	monthly: {
		appointmentsCount: number;
		newPatientsCount: number;
		revenue: number;
		revenueTrend: Array<{
			week: number;
			revenue: number;
			appointments: number;
		}>;
		averageWaitTime: number;
		patientSatisfaction: number;
		popularServices: Array<{
			id: string;
			name: string;
			count: number;
			revenue: number;
		}>;
	};
	alerts: Array<{
		id: string;
		type: "warning" | "error" | "info";
		title: string;
		message: string;
		timestamp: string;
		action?: {
			label: string;
			href: string;
		};
	}>;
	recentActivity: Array<{
		id: string;
		type: "appointment" | "patient" | "payment" | "prescription";
		action: "created" | "updated" | "cancelled" | "completed";
		description: string;
		user: string;
		timestamp: string;
	}>;
}

// Base dashboard procedure (extends auth)
export const dashboardProcedure = protectedProcedure;

// ============================================
// Main Dashboard Stats
// ============================================

export const getDashboardStats = dashboardProcedure.handler(async ({ context }): Promise<DashboardStats> => {
	const { db, user: ctxUser, clinicId } = context;
	if (!clinicId) throw new Error("Clinic ID is required");

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - today.getDay());
	startOfWeek.setHours(0, 0, 0, 0);

	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);

	console.debug("Fetching dashboard stats", {
		clinicId,
		userId: ctxUser?.id,
		dateRange: { startOfWeek, endOfWeek, startOfMonth }
	});

	try {
		// Run all queries in parallel with proper error handling
		const [
			// Overview stats
			totalPatients,
			totalAppointments,
			activeDoctors,
			activeStaff,

			// Today's stats
			todayAppointments,
			todayAppointmentsList,
			todayRevenue,
			todayCompletedAppointments,
			todayCancelledAppointments,

			// Weekly stats
			weeklyAppointments,
			weeklyNewPatients,
			weeklyRevenue,
			weeklyAppointmentsByDay,
			weeklyTopDoctors,

			// Monthly stats
			monthlyAppointments,
			monthlyNewPatients,
			monthlyRevenue,
			monthlyRevenueByWeek,
			monthlyPopularServices,
			monthlyAvgWaitTime,

			// Alerts & activity
			pendingPrescriptions,
			dueImmunizations,
			lowStockItems,
			expiringLicenses,
			recentActivity
		] = await Promise.all([
			// Overview
			db.$count(patient, and(eq(patient.clinicId, clinicId), eq(patient.isDeleted, false))),
			db.$count(appointment, and(eq(appointment.clinicId, clinicId), eq(appointment.isDeleted, false))),
			db.$count(doctor, and(eq(doctor.clinicId, clinicId), eq(doctor.isDeleted, false))),
			db.$count(staff, and(eq(staff.clinicId, clinicId), eq(staff.isActive, true))),

			// Today's appointments count
			db.$count(
				appointment,
				and(
					eq(appointment.clinicId, clinicId),
					eq(appointment.isDeleted, false),
					gte(appointment.appointmentDate, today),
					lt(appointment.appointmentDate, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
					notInArray(appointment.status, ["CANCELLED", "COMPLETED", "NO_SHOW"])
				)
			),

			// Today's appointments list
			db.query.appointment.findMany({
				where: and(
					eq(appointment.clinicId, clinicId),
					eq(appointment.isDeleted, false),
					gte(appointment.appointmentDate, today),
					lt(appointment.appointmentDate, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
					notInArray(appointment.status, ["CANCELLED", "COMPLETED", "NO_SHOW"])
				),
				with: {
					patient: {
						with: { user: true }
					},
					doctor: {
						with: { user: true }
					}
				},
				orderBy: [asc(appointment.appointmentDate)],
				limit: 20
			}),

			// Today's revenue
			db
				.select({ sum: sql<number>`sum(${payment.amountPaid})` })
				.from(payment)
				.where(
					and(
						eq(payment.clinicId, clinicId),
						eq(payment.status, "PAID"),
						gte(payment.paymentDate, today),
						lt(payment.paymentDate, new Date(today.getTime() + 24 * 60 * 60 * 1000))
					)
				),

			// Today's completed appointments
			db.$count(
				appointment,
				and(
					eq(appointment.clinicId, clinicId),
					eq(appointment.isDeleted, false),
					gte(appointment.appointmentDate, today),
					lt(appointment.appointmentDate, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
					eq(appointment.status, "COMPLETED")
				)
			),

			// Today's cancelled appointments
			db.$count(
				appointment,
				and(
					eq(appointment.clinicId, clinicId),
					eq(appointment.isDeleted, false),
					gte(appointment.appointmentDate, today),
					lt(appointment.appointmentDate, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
					eq(appointment.status, "CANCELLED")
				)
			),

			// Weekly appointments count
			db.$count(
				appointment,
				and(
					eq(appointment.clinicId, clinicId),
					eq(appointment.isDeleted, false),
					gte(appointment.appointmentDate, startOfWeek),
					lte(appointment.appointmentDate, endOfWeek)
				)
			),

			// Weekly new patients
			db.$count(
				patient,
				and(
					eq(patient.clinicId, clinicId),
					eq(patient.isDeleted, false),
					gte(patient.createdAt, startOfWeek),
					lte(patient.createdAt, endOfWeek)
				)
			),

			// Weekly revenue
			db
				.select({ sum: sql<number>`sum(${payment.amountPaid})` })
				.from(payment)
				.where(
					and(
						eq(payment.clinicId, clinicId),
						eq(payment.status, "PAID"),
						gte(payment.paymentDate, startOfWeek),
						lte(payment.paymentDate, endOfWeek)
					)
				),

			// Weekly appointments by day
			db
				.select({
					day_of_week: sql<number>`strftime('%w', ${appointment.appointmentDate})`,
					date: sql<string>`date(${appointment.appointmentDate})`,
					count: sql<number>`count(*)`
				})
				.from(appointment)
				.where(
					and(
						eq(appointment.clinicId, clinicId),
						eq(appointment.isDeleted, false),
						between(appointment.appointmentDate, startOfWeek, endOfWeek)
					)
				)
				.groupBy(sql`date(${appointment.appointmentDate})`),

			// Weekly top doctors
			db.query.doctor.findMany({
				where: and(eq(doctor.clinicId, clinicId), eq(doctor.isDeleted, false)),
				with: {
					appointments: true
					// Note: Complex aggregations like top doctors are better handled with custom SQL in Drizzle
				},
				limit: 5
			}),

			// Monthly appointments count
			db.$count(
				appointment,
				and(
					eq(appointment.clinicId, clinicId),
					eq(appointment.isDeleted, false),
					gte(appointment.createdAt, startOfMonth)
				)
			),

			// Monthly new patients
			db.$count(
				patient,
				and(eq(patient.clinicId, clinicId), eq(patient.isDeleted, false), gte(patient.createdAt, startOfMonth))
			),

			// Monthly revenue
			db
				.select({ sum: sql<number>`sum(${payment.amountPaid})` })
				.from(payment)
				.where(
					and(
						eq(payment.clinicId, clinicId),
						eq(payment.status, "PAID"),
						gte(payment.paymentDate, startOfMonth)
					)
				),

			// Monthly revenue by week
			db
				.select({
					week: sql<number>`strftime('%W', ${payment.paymentDate})`,
					revenue: sql<number>`sum(${payment.amountPaid})`,
					payment_count: sql<number>`count(*)`
				})
				.from(payment)
				.where(
					and(
						eq(payment.clinicId, clinicId),
						eq(payment.status, "PAID"),
						gte(payment.paymentDate, startOfMonth)
					)
				)
				.groupBy(sql`strftime('%W', ${payment.paymentDate})`)
				.orderBy(asc(sql`strftime('%W', ${payment.paymentDate})`)),

			// Monthly popular services
			db.query.service.findMany({
				where: and(eq(service.clinicId, clinicId), eq(service.isDeleted, false)),
				limit: 5
			}),

			// Average wait time (in minutes) - using appointment data
			db
				.select({
					avg_wait_time: sql<number>`avg((julianday(${appointment.updatedAt}/1000, 'unixepoch') - julianday(${appointment.appointmentDate}/1000, 'unixepoch')) * 1440)`
				})
				.from(appointment)
				.where(
					and(
						eq(appointment.clinicId, clinicId),
						eq(appointment.status, "COMPLETED"),
						gte(appointment.createdAt, startOfMonth)
					)
				),

			// Alerts
			db.$count(
				prescription,
				and(
					eq(prescription.clinicId, clinicId),
					eq(prescription.status, "active"),
					lt(prescription.endDate, new Date())
				)
			),

			db.$count(
				immunization,
				and(
					eq(immunization.clinicId, clinicId),
					eq(immunization.status, "PENDING"),
					eq(immunization.isOverDue, true)
				)
			),

			db.$count(
				prescribedItem,
				and(eq(prescribedItem.clinicId, clinicId), sql`${prescribedItem.frequency} <= "Three Times"`)
			), // Example logic

			db.$count(
				clinics,
				and(eq(clinics.id, clinicId), lt(clinics.updatedAt, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)))
			),

			// Recent activity (simplified)
			db.query.appointment.findMany({
				where: and(eq(appointment.clinicId, clinicId), eq(appointment.isDeleted, false)),
				with: {
					patient: {
						with: { user: true }
					},
					doctor: {
						with: { user: true }
					}
				},
				orderBy: [desc(appointment.createdAt)],
				limit: 10
			})
		]);

		// Process data into structured format
		const occupancyRate =
			totalAppointments > 0 && activeDoctors > 0
				? Math.min(100, Math.round((todayAppointments / (activeDoctors * 8)) * 100))
				: 0;

		// Format today's appointments
		const formattedTodayAppointments = todayAppointmentsList.map(apt => ({
			id: apt.id,
			time: apt.appointmentDate.toLocaleTimeString(),
			patientName:
				apt.patient?.user?.name ||
				(apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : "Unknown"),
			doctorName: apt.doctor?.user?.name || apt.doctor?.name || "Unknown",
			status: apt.status || "SCHEDULED"
		}));

		// Process weekly appointments by day
		const weeklyAppointmentsByDayFormatted = (
			weeklyAppointmentsByDay as Array<{ day_of_week: number; count: number; date: string }>
		).map(item => ({
			day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][item.day_of_week],
			count: Number(item.count),
			date: item.date
		}));

		// Process weekly top doctors
		const formattedTopDoctors = weeklyTopDoctors.map(doctor => ({
			id: doctor.id,
			name: doctor.name,
			appointmentCount: doctor.appointments.length,
			revenue: 0 // Simplified for migration
		}));

		// Process monthly revenue trend
		const revenueTrend = (
			monthlyRevenueByWeek as unknown as Array<{ week: number; revenue: number; payment_count: number }>
		).map(item => ({
			week: Number(item.week),
			revenue: Number(item.revenue),
			appointments: Number(item.payment_count)
		}));

		// Process monthly popular services
		const formattedPopularServices = monthlyPopularServices.map(service => ({
			id: service.id,
			name: service.serviceName,
			count: 0,
			revenue: 0
		}));

		// Create alerts
		const alerts = [];

		if (pendingPrescriptions > 0) {
			alerts.push({
				id: "pending-prescriptions",
				type: "warning" as const,
				title: "Expiring Prescriptions",
				message: `${pendingPrescriptions} prescriptions are about to expire or have already expired.`,
				timestamp: new Date().toISOString(),
				action: {
					label: "Review Prescriptions",
					href: "/prescriptions/pending"
				}
			});
		}

		if (dueImmunizations > 0) {
			alerts.push({
				id: "due-immunizations",
				type: "error" as const,
				title: "Overdue Immunizations",
				message: `${dueImmunizations} immunizations are overdue.`,
				timestamp: new Date().toISOString(),
				action: {
					label: "View Immunizations",
					href: "/immunizations/due"
				}
			});
		}

		if (lowStockItems > 0) {
			alerts.push({
				id: "low-stock",
				type: "warning" as const,
				title: "Low Stock Alert",
				message: `${lowStockItems} inventory items are below reorder point.`,
				timestamp: new Date().toISOString(),
				action: {
					label: "Review Inventory",
					href: "/inventory/low-stock"
				}
			});
		}

		if (expiringLicenses > 0) {
			alerts.push({
				id: "expiring-licenses",
				type: "info" as const,
				title: "License Expiring Soon",
				message: `${expiringLicenses} clinic licenses will expire within 30 days.`,
				timestamp: new Date().toISOString(),
				action: {
					label: "Manage Licenses",
					href: "/settings/licenses"
				}
			});
		}

		// Process recent activity
		const formattedRecentActivity = recentActivity.map(activity => ({
			id: activity.id,
			type: "appointment" as const,
			action: mapActionToActivity(activity.status || "updated"),
			description: `Appointment for ${activity.patient?.user?.name || "Patient"} with Dr. ${activity.doctor?.user?.name || "Doctor"}`,
			user: activity.doctor?.user?.name || "System",
			timestamp: activity.updatedAt.toISOString()
		}));

		console.info("Dashboard stats fetched successfully", {
			clinicId,
			totalPatients,
			todayAppointments,
			monthlyRevenue: monthlyRevenue[0]?.sum || 0
		});

		return {
			overview: {
				totalPatients,
				totalAppointments,
				activeDoctors,
				activeStaff,
				occupancyRate,
				// Add these helper fields to make frontend access cleaner
				pendingPrescriptionsCount: pendingPrescriptions,
				lowStockItemsCount: lowStockItems
			},
			today: {
				appointments: todayAppointments,
				appointmentsList: formattedTodayAppointments,
				revenue: toNumber(todayRevenue[0]?.sum) || 0,
				completedAppointments: todayCompletedAppointments,
				cancelledAppointments: todayCancelledAppointments
			},
			weekly: {
				appointmentsCount: weeklyAppointments,
				appointmentsByDay: weeklyAppointmentsByDayFormatted,
				newPatientsCount: weeklyNewPatients,
				revenue: toNumber(weeklyRevenue[0]?.sum) || 0,
				topDoctors: formattedTopDoctors
			},
			monthly: {
				appointmentsCount: monthlyAppointments,
				newPatientsCount: monthlyNewPatients,
				revenue: toNumber(monthlyRevenue[0]?.sum) || 0,
				revenueTrend,
				averageWaitTime: Math.round(
					(monthlyAvgWaitTime as unknown as Array<{ avg_wait_time: number }>)[0]?.avg_wait_time || 0
				),
				patientSatisfaction: calculatePatientSatisfaction(), // Implement based on your survey data
				popularServices: formattedPopularServices
			},
			alerts,
			recentActivity: formattedRecentActivity
		};
	} catch (error) {
		console.error("Failed to fetch dashboard stats", { error });
		throw error;
	}
});

// ============================================
// Helper Functions
// ============================================

// ============================================
// Specialized Dashboard Procedures
// ============================================

export const getRecentAppointments = dashboardProcedure
	.input(
		z.object({
			limit: z.number().int().min(1).max(50).default(10),
			status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
		})
	)
	.handler(async ({ context, input }) => {
		const { db, clinicId } = context;

		const appointments = await db.query.appointment.findMany({
			where: and(
				eq(appointment.clinicId, clinicId ?? ""),
				eq(appointment.isDeleted, false),
				input.status ? eq(appointment.status, input.status) : undefined
			),
			with: {
				patient: {
					with: { user: true }
				},
				doctor: {
					with: { user: true }
				}
			} as const,
			orderBy: [desc(appointment.appointmentDate)],
			limit: input.limit
		});

		return JSON.parse(JSON.stringify(appointments)) as typeof appointments;
	});

export const getRevenueOverview = dashboardProcedure
	.input(
		z.object({
			startDate: z.coerce.date(),
			endDate: z.coerce.date(),
			groupBy: z.enum(["day", "week", "month"]).default("day")
		})
	)
	.handler(async ({ context, input }) => {
		const { db, clinicId } = context;
		const { startDate, endDate, groupBy } = input;

		let groupByClause: string;
		switch (groupBy) {
			case "day":
				groupByClause = "date(payment_date/1000, 'unixepoch')";
				break;
			case "week":
				groupByClause = "strftime('%W', payment_date/1000, 'unixepoch')";
				break;
			case "month":
				groupByClause = "strftime('%m', payment_date/1000, 'unixepoch')";
				break;
		}

		const revenue = await db
			.select({
				period: sql.raw(groupByClause),
				total: sql<number>`sum(${payment.amountPaid})`,
				count: sql<number>`count(*)`,
				average: sql<number>`avg(${payment.amountPaid})`
			})
			.from(payment)
			.where(
				and(
					eq(payment.clinicId, clinicId ?? ""),
					eq(payment.status, "PAID"),
					between(payment.paymentDate, startDate, endDate)
				)
			)
			.groupBy(sql.raw(groupByClause));

		const totalRevenue = await db
			.select({
				sum: sql<number>`sum(${payment.amountPaid})`,
				count: sql<number>`count(*)`
			})
			.from(payment)
			.where(
				and(
					eq(payment.clinicId, clinicId ?? ""),
					eq(payment.status, "PAID"),
					gte(payment.paymentDate, startDate),
					lte(payment.paymentDate, endDate)
				)
			);

		return {
			revenue: revenue,
			summary: {
				total: totalRevenue[0]?.sum || 0,
				transactionCount: totalRevenue[0]?.count || 0,
				averageTransaction:
					(totalRevenue[0]?.count || 0) > 0 ? (totalRevenue[0]?.sum || 0) / totalRevenue[0]?.count : 0
			}
		};
	});

export const getPatientDemographics = dashboardProcedure.handler(async ({ context }) => {
	const { db, clinicId } = context;

	const [ageGroups, genderDistribution, locations] = await Promise.all([
		db
			.select({
				age_group: sql<string>`CASE
				WHEN (strftime('%Y', 'now') - strftime('%Y', ${patient.dateOfBirth})) < 18 THEN '0-17'
				WHEN (strftime('%Y', 'now') - strftime('%Y', ${patient.dateOfBirth})) BETWEEN 18 AND 30 THEN '18-30'
				WHEN (strftime('%Y', 'now') - strftime('%Y', ${patient.dateOfBirth})) BETWEEN 31 AND 50 THEN '31-50'
				WHEN (strftime('%Y', 'now') - strftime('%Y', ${patient.dateOfBirth})) BETWEEN 51 AND 70 THEN '51-70'
				ELSE '70+'
			END`,
				count: sql<number>`count(*)`
			})
			.from(patient)
			.where(and(eq(patient.clinicId, clinicId ?? ""), eq(patient.isDeleted, false)))
			.groupBy(sql`age_group`),
		db
			.select({ gender: patient.gender, count: sql`count(*)` })
			.from(patient)
			.where(and(eq(patient.clinicId, clinicId ?? ""), eq(patient.isDeleted, false)))
			.groupBy(patient.gender),
		db
			.select({ address: patient.address, count: sql`count(*)` })
			.from(patient)
			.where(and(eq(patient.clinicId, clinicId ?? ""), eq(patient.isDeleted, false), ne(patient.address, "")))
			.groupBy(patient.address)
			.orderBy(desc(sql`count(*)`))
			.limit(10)
	]);

	return {
		ageGroups: ageGroups,
		genderDistribution,
		topLocations: locations
	};
});

export const getDoctorPerformance = dashboardProcedure
	.input(
		z.object({
			period: z.enum(["week", "month", "year"]).default("month"),
			doctorId: z.string().optional()
		})
	)
	.handler(async ({ context, input }) => {
		const { db, clinicId } = context;

		// Safety check for clinic context
		if (!clinicId) {
			throw new Error("Clinic context not found");
		}

		const { period, doctorId } = input;

		const startDate = new Date();
		switch (period) {
			case "week":
				startDate.setDate(startDate.getDate() - 7);
				break;
			case "month":
				startDate.setMonth(startDate.getMonth() - 1);
				break;
			case "year":
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
		}

		const doctorsList = await db.query.doctor.findMany({
			where: and(
				eq(doctor.clinicId, clinicId),
				eq(doctor.isDeleted, false),
				doctorId ? eq(doctor.id, doctorId) : undefined
			),
			with: {
				appointments: {
					where: gte(appointment.appointmentDate, startDate)
				}
			}
		});

		const performance = doctorsList.map(doctor => ({
			id: doctor.id,
			name: doctor.name,
			specialization: doctor.specialty,
			totalAppointments: doctor.appointments.length,
			totalRevenue: 0, // Simplified
			averageRating: 0,
			reviewCount: 0,
			uniquePatients: new Set(doctor.appointments.map(a => a.patientId)).size,
			completionRate: 0
		}));

		return JSON.parse(JSON.stringify(performance));
	});
