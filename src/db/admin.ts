// prisma/seed.ts or scripts/seed.ts
import 'dotenv/config';

import { faker } from '@faker-js/faker';
import { JOBTYPE, Role } from 'generated/client/enums';

import db from '@/db';
import { auth } from '@/lib/auth';

async function seed() {
  try {
    // Clear Doctor table first as it depends on User
    await db.doctor.deleteMany();
    await db.user.deleteMany();

    // --- Define Admin User Data ---
    const adminEmail = process.env.ADMIN_EMAIL || 'clinysmar@gmail.com';
    // Updated password for a stronger policy
    const adminPassword = process.env.ADMIN_PASSWORD || 'Health24!Secure$';
    const adminName = process.env.ADMIN_NAME || 'Hazem Ali';
    const adminPhone = '01003497579';

    let adminUserId: string;
    try {
      const existingUser = await auth.api.getUserByEmail(adminEmail);
      if (existingUser?.id) {
        adminUserId = existingUser.id;
      } else {
        // This will throw if the user is not found, handled by the outer catch
        throw new Error('User not found, proceeding with creation.');
      }
    } catch (_error) {
      const adminAuthSignUpResult = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName
        }
      });

      if (!adminAuthSignUpResult || !adminAuthSignUpResult.user || !adminAuthSignUpResult.user.id) {
        console.error(
          'Failed to create admin user via authentication service. Result:',
          adminAuthSignUpResult
        );
        throw new Error(
          'Failed to create admin user. Check auth service configuration and response.'
        );
      }

      adminUserId = adminAuthSignUpResult.user.id;
    }

    // --- Create or Update User in Prisma ---
    // This step ensures the user exists in your database and has the correct role
    await db.user.upsert({
      where: { id: adminUserId },
      update: { role: Role.ADMIN },
      create: {
        id: adminUserId,
        email: adminEmail,
        name: adminName,
        phone: adminPhone,
        role: Role.ADMIN
      }
    });
    const _hazemDoctor = await db.doctor.upsert({
      where: { id: adminUserId },
      update: {
        email: adminEmail,
        name: adminName,
        specialization: 'Pediatrician',
        licenseNumber: 'HAZEM12345',
        phone: adminPhone,
        address: faker.location.streetAddress(),
        department: 'Pediatrics',
        img: faker.image.avatar(),
        colorCode: faker.color.rgb(),
        availabilityStatus: 'Available',
        type: JOBTYPE.FULL
      },
      create: {
        id: adminUserId,
        email: adminEmail,
        name: adminName,
        specialization: 'Pediatrician',
        licenseNumber: 'HAZEM12345',
        phone: adminPhone,
        address: faker.location.streetAddress(),
        department: 'Pediatrics',
        img: faker.image.avatar(),
        colorCode: faker.color.rgb(),
        availabilityStatus: 'Available',
        type: JOBTYPE.FULL,
        // Connect to the User profile we just ensured exists
        user: { connect: { id: adminUserId } }
      }
    });

    // --- Set the final role to DOCTOR if he is both ---
    await db.user.update({
      where: { id: adminUserId },
      data: { role: Role.DOCTOR }
    });
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Execute the seed function
seed();
