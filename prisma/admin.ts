// prisma/seed.ts or scripts/seed.ts
import 'dotenv/config'
import { faker } from '@faker-js/faker' // Import faker for generating dummy data

import { auth } from '@/lib/auth' // Your authentication library
import db from '@/lib/db'
import { JOBTYPE, Role } from 'generated/client/enums'


async function seed() {
	console.log('Starting seed process...')

	try {
		// --- Clear Data in Reverse Order of Dependencies (Cascading Deletes if configured) ---
		// Corrected model names based on typical Prisma singular PascalCase naming
		console.log('Clearing existing data...')
		await db.auditLog.deleteMany()
		await db.rating.deleteMany()
		await db.patientBills.deleteMany() // Corrected from patientBills
		await db.payment.deleteMany()
		await db.labTest.deleteMany()
		await db.prescription.deleteMany()
		await db.diagnosis.deleteMany()
		await db.vitalSigns.deleteMany() // Corrected from vitalSigns
		await db.medicalRecords.deleteMany() // Corrected from medicalRecords
		await db.appointment.deleteMany()
		await db.workingDays.deleteMany() // Corrected from workingDays
		await db.doctor.deleteMany()
		await db.staff.deleteMany()
		await db.patient.deleteMany()
		await db.services.deleteMany() // Corrected from services
		await db.wHOGrowthStandard.deleteMany() // Corrected casing

		// Clear User table last if Patient, Doctor, Staff depend on it
		await db.user.deleteMany()
		console.log('Existing data cleared.')

		// --- Create Admin User (Hazem Ali) ---
		const adminEmail = process.env.ADMIN_EMAIL || 'clinysmar@gmail.com'
		const adminPassword = process.env.ADMIN_PASSWORD || 'Health24'
		const adminName = process.env.ADMIN_NAME || 'Hazem Ali'
		const adminPhone = '01003497579'
		console.log(`Attempting to create admin user: ${adminName} (${adminEmail})...`)

		const adminAuthSignUpResult = await auth.api.signUpEmail({
			body: {
				email: adminEmail,
				password: adminPassword,
				name: adminName,
			},
		})

		if (!adminAuthSignUpResult || !adminAuthSignUpResult.user || !adminAuthSignUpResult.user.id) {
			console.error(
				'Failed to create admin user via authentication service. Result:',
				adminAuthSignUpResult,
			)
			throw new Error('Failed to create admin user. Check auth service configuration and response.')
		}

		const { id: adminUserId, email: adminUserEmail } = adminAuthSignUpResult.user
		console.log(
			`Admin user created successfully via auth service: ID - ${adminUserId}, Email - ${adminUserEmail}`,
		)

		// Update Prisma User role to ADMIN
		await db.user.update({
			where: { id: adminUserId },
			data: { role: Role.ADMIN },
		})
		console.log(`Admin user ${adminUserId} role updated to ADMIN in Prisma.`)

		// --- Create Doctor Profile for Hazem Ali (linked to the admin user) ---
		console.log(`Creating Doctor profile for ${adminName}...`)
		const hazemDoctor = await db.doctor.create({
			data: {
				id: adminUserId, // Use the same ID as the admin user
				// Connect to the User profile created by the auth service
				user: { connect: { id: adminUserId } },
				email: adminEmail, // Use admin email
				name: adminName, // Use admin name
				specialization: 'Pediatrician', // Specific specialization for Hazem
				licenseNumber: 'HAZEM12345', // Unique license number
				phone: adminPhone,
				address: faker.location.streetAddress(),
				department: 'Pediatrics',
				img: faker.image.avatar(),
				colorCode: faker.color.rgb(),
				availabilityStatus: 'Available',
				type: JOBTYPE.FULL, // Example specific job type
			},
		})
		console.log(`Created Doctor profile for Hazem Ali (ID: ${hazemDoctor.id}).`)

		// Optionally, update the user role to DOCTOR as well, or you might have a USER_ADMIN_DOCTOR role
		// If a user can have multiple roles, you'd handle this differently.
		// For simplicity, if he's primarily an admin who is also a doctor:
		await db.user.update({
			where: { id: adminUserId },
			data: { role: Role.DOCTOR }, // If DOCTOR overrides ADMIN, or you have a combined role
		})
		console.log(`Admin user ${adminUserId} role updated to DOCTOR in Prisma (if applicable).`)
	} catch (error) {
		console.error('Seed process failed:', error)
		process.exit(1) // Exit with an error code
	} finally {
		await db.$disconnect()
		console.log('Seed process finished.')
	}
}

// Execute the seed function
seed()
