// src/orpc/routers/index.ts
// Central appRouter — all procedures are namespaced under logical groups.
// Keep procedures under their namespace only; avoid top-level duplicates.

import { os } from "@orpc/server";

import type { Context } from "../context";
import { banUser, createUser, listUsers, removeUser, revokeAllUserSessions, unbanUser, updateUserRole } from "./admin";
import {
	cancelAppointment,
	createAppointment,
	getAppointmentById,
	getAppointments,
	getAppointmentsByDateRange,
	listAppointments,
	updateAppointmentStatus
} from "./appointment";
import { signup } from "./auth";
import { addClinicMember, createClinic, getClinicStats } from "./clinic";
import {
	getDashboardStats,
	getDoctorPerformance,
	getPatientDemographics,
	getRecentAppointments,
	getRevenueOverview
} from "./dashboard";
import {
	createDoctor,
	getAvailableDoctors,
	getDoctor,
	getDoctorSchedule,
	getDoctorStatistics,
	listDoctors
} from "./doctor";
import { createEncounter, listEncounters } from "./encounter";
import { getGrowthChart, getGrowthPercentile, recordGrowth } from "./growth";
import { getPatientImmunizationSchedule, recordImmunization } from "./immunization";
import {
	createCompleteEncounter,
	createMedicalRecord,
	getMedicalRecordById,
	getPatientMedicalHistory
} from "./medical-record";
import { createPatient, deletePatient, getPatient, getPatientStats, listPatients, updatePatient } from "./patient";
import {
	createPrescription,
	getPatientActivePrescriptions,
	getPrescription,
	listDrugs,
	updatePrescription
} from "./prescription";
import { getService, listServices } from "./service";
import { addTodo, listTodos } from "./todos";
import {
	createDiagnosis,
	createVitalSigns,
	deleteDiagnosis,
	deleteVitalSigns,
	getDiagnosisById,
	getDiagnosisStatistics,
	getLatestVitalSigns,
	getPatientHistory,
	getVitalSignsById,
	getVitalSignsTrend,
	listDiagnoses,
	listVitalSignsByPatient,
	updateDiagnosis,
	updateVitalSigns
} from "./vital-sign";

export const router = os.$context<Context>().router({
	// export default {
	// ── Appointments ──────────────────────────────────────────────────────────
	appointments: {
		create: createAppointment,
		get: getAppointments,
		getById: getAppointmentById,
		list: listAppointments,
		cancel: cancelAppointment,
		getByDateRange: getAppointmentsByDateRange,
		update: updateAppointmentStatus
	},

	// ── Dashboard ─────────────────────────────────────────────────────────────
	dashboard: {
		getDashboardStats,
		getDoctorPerformance,
		getPatientDemographics,
		getRecentAppointments,
		getRevenueOverview
	},

	// ── Clinic management (admin) ─────────────────────────────────────────────
	clinic: {
		create: createClinic,
		addMember: addClinicMember,
		getStats: getClinicStats
	},

	// ── Doctors ───────────────────────────────────────────────────────────────
	doctors: {
		list: listDoctors,
		get: getDoctor,
		getStats: getDoctorStatistics,
		create: createDoctor,
		getWithSchedule: getDoctorSchedule,
		getAvailable: getAvailableDoctors
	},

	// ── Growth tracking ───────────────────────────────────────────────────────
	growth: {
		record: recordGrowth,
		getChart: getGrowthChart,
		getPercentile: getGrowthPercentile
	},

	// ── Vital signs & diagnoses ───────────────────────────────────────────────
	vitalSigns: {
		create: createVitalSigns,
		update: updateVitalSigns,
		delete: deleteVitalSigns,
		getById: getVitalSignsById,
		getLatest: getLatestVitalSigns,
		getTrend: getVitalSignsTrend,
		list: listVitalSignsByPatient,
		getHistory: getPatientHistory
	},
	diagnoses: {
		create: createDiagnosis,
		update: updateDiagnosis,
		delete: deleteDiagnosis,
		getById: getDiagnosisById,
		list: listDiagnoses,
		getStatistics: getDiagnosisStatistics
	},

	// ── Immunizations ─────────────────────────────────────────────────────────
	immunizations: {
		record: recordImmunization,
		getSchedule: getPatientImmunizationSchedule
	},

	// ── Medical records ───────────────────────────────────────────────────────
	medicalRecords: {
		createCompleteEncounter,
		get: getMedicalRecordById,
		create: createMedicalRecord,
		getHistory: getPatientMedicalHistory
	},

	// ── Patients ──────────────────────────────────────────────────────────────
	patients: {
		create: createPatient,
		get: getPatient,
		list: listPatients,
		update: updatePatient,
		delete: deletePatient,
		getStats: getPatientStats
	},

	// ── Prescriptions ─────────────────────────────────────────────────────────
	prescriptions: {
		create: createPrescription,
		get: getPrescription,
		listDrugs,
		update: updatePrescription,
		getActiveForPatient: getPatientActivePrescriptions
	},

	// ── Encounters ────────────────────────────────────────────────────────────
	encounters: {
		create: createEncounter,
		list: listEncounters
	},

	// ── Services ──────────────────────────────────────────────────────────────
	services: {
		list: listServices,
		get: getService
	},

	// ── Admin ─────────────────────────────────────────────────────────────────
	admin: {
		createUser,
		listUsers,
		banUser,
		signup,
		unbanUser,
		removeUser,
		revokeAllUserSessions,
		updateUserRole
	},
	listTodos,
	addTodo
});
export default router;
export type AppRouter = typeof router;
