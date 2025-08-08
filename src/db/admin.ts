// prisma/seed.ts or scripts/seed.ts
import 'dotenv/config'

import { Role } from '@prisma/client'

import db from '@/db'
import { auth } from '@/lib/auth'

async function seed() {
  try {
    // Clear Doctor table first as it depends on User
    await db.doctor.deleteMany()
    await db.user.deleteMany()

    // --- Define Admin User Data ---
    const adminEmail = process.env.ADMIN_EMAIL || 'clinysmar@gmail.com'
    // Updated password for a stronger policy
    const adminPassword = process.env.ADMIN_PASSWORD || 'Health24!Secure$'
    const adminName = process.env.ADMIN_NAME || 'Hazem Ali'

    let adminUserId: string // adminUserId must always be a string

    try {
      const existingUserResult = await auth.api.listUsers({
        query: {
          searchField: 'email',
          searchValue: adminEmail,
        },
      })

      // Check if a user was found and its ID is a valid string
      if (
        existingUserResult?.users.length > 0 &&
        existingUserResult.users[0]?.id
      ) {
        adminUserId = existingUserResult.users[0].id // Type is now guaranteed to be string within this block
      } else {
        // If no user is found, or the user's ID is missing/undefined,
        // throw an error to proceed with user creation in the catch block.
        throw new Error(
          'User not found or ID missing, proceeding with creation.',
        )
      }
    } catch (_error) {
      // If the user wasn't found (or an error occurred during lookup), attempt to sign them up.
      const adminAuthSignUpResult = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      })

      // Ensure the sign-up was successful and a user with an ID was returned
      if (
        !adminAuthSignUpResult ||
        !adminAuthSignUpResult.user ||
        !adminAuthSignUpResult.user.id
      ) {
        console.error(
          'Failed to create admin user via authentication service. Result:',
          adminAuthSignUpResult,
        )
        throw new Error(
          'Failed to create admin user. Check auth service configuration and response.',
        )
      }

      adminUserId = adminAuthSignUpResult.user.id // This assignment is safe because of the checks above
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
        role: Role.ADMIN,
      },
    })

    // --- Set the final role to DOCTOR if he is both ---
    await db.user.update({
      where: { id: adminUserId },
      data: { role: Role.DOCTOR },
    })
  } catch (error) {
    console.error('Seed process failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Execute the seed function
seed()
