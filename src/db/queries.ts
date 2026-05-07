import { and, eq } from "drizzle-orm";

import { db } from ".";
import { clinicMembers, doctor, guardian, user } from "./schema";

export async function checkVitalSignsAccess(userId: string, patientId: string): Promise<boolean> {
	const userData = await db.query.user.findFirst({
		where: eq(user.id, userId),
		with: {
			patients: true,
			doctors: true
		}
	});

	if (!userData) return false;

	if (userData.role === "admin" || userData.role === "staff") return true;
	if (userData.role === "doctor" && userData.doctors) return true;
	if (userData.role === "patient" && Array.isArray(userData.patients)) {
		return userData.patients.some(p => p.id === patientId);
	}

	// Check if user is guardian
	const guardianRecord = await db.query.guardian.findFirst({
		where: and(eq(guardian.userId, userId), eq(guardian.patientId, patientId))
	});

	return !!guardianRecord;
}

// Helper function to check doctor access
export async function checkDoctorAccess(doctorId: string, userId: string, clinicId?: string) {
	const userRecord = await db.query.user.findFirst({
		where: eq(user.id, userId),
		with: {
			doctors: true,
			clinics: true
		}
	});

	if (!userRecord) return false;

	// Admin has full access
	if (userRecord.role === "admin" || userRecord.role === "superadmin") return true;

	// Staff has limited access
	if (userRecord.role === "staff") return true;

	// Doctor access
	if (userRecord.role === "doctor") {
		const doctorRecord = await db.query.doctor.findFirst({
			where: and(eq(doctor.userId, userId), eq(doctor.id, doctorId))
		});
		return !!doctorRecord;
	}

	// Check clinic membership
	if (clinicId) {
		const clinicMember = await db.query.clinicMembers.findFirst({
			where: and(eq(clinicMembers.userId, userId), eq(clinicMembers.clinicId, clinicId))
		});
		return !!clinicMember;
	}

	return false;
}
