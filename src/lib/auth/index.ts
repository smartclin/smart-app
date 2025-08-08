// src/lib/auth/index.ts

// Prisma Client setup
import { PrismaClient } from '@prisma/client'
// Core Better Auth imports
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin, anonymous, multiSession, twoFactor } from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
// Next.js specific imports for server-side context
import { headers } from 'next/headers'
import { cache } from 'react'
// Email sending (Resend) and custom email component
import { Resend } from 'resend'

import ResetPasswordEmail from '@/components/emals/reset-password' // Typo: emals -> emails? Assuming it's correct.

const prisma = new PrismaClient() // Initialize Prisma client here

// Custom roles (assuming these are defined in a separate file)
import { ac, allRoles } from './roles' // Ensure ac and allRoles are correctly typed and exported from './roles'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// --------------------------------------------------------------------------
// Initialize Better Auth
// This needs to be the default export OR named 'auth' and then default exported
// for the CLI tool to properly pick up the configuration.
// --------------------------------------------------------------------------
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      // Ensure these environment variables are correctly set in .env
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    // Add other social providers here (e.g., github, discord)
  },
  // trustedOrigins: process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [], // Use env for trusted origins
  // IMPORTANT: For development, `trustedOrigins` might need to include `http://localhost:3000`
  // if your frontend is on a different port than BetterAuth backend.
  // Generally, it's safer to read this from env if your app is hosted.
  // However, for development, if `CORS_ORIGIN` is always 'localhost', `z.url()` might cause issues
  // if it's not a full URL.

  user: {
    // Define additional fields for your User model
    additionalFields: {
      isAnonymous: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      messageCount: {
        type: 'number',
        required: false,
        defaultValue: 0,
      },
      imageCount: {
        type: 'number',
        required: false,
        defaultValue: 0,
      },
      lastReset: {
        type: 'date',
        required: false,
      },
      role: {
        type: 'string', // Ensure this matches your Prisma schema ENUM if applicable
        input: false, // Prevents this from being directly set by client
      },
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      requireVerification: false, // Set to true for higher security
    },
    deleteUser: {
      enabled: true,
      deleteSessions: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in user after successful registration/login
    sendResetPassword: async ({ user, url }) => {
      // Ensure `user.email` and `user.name` are available
      if (!user.email) {
        console.error('Reset password email failed: User email is missing.')
        return
      }
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd', // Ensure this is a verified sender in Resend
        subject: 'Reset your password for Smart Clinic App', // More specific subject
        react: ResetPasswordEmail({
          resetLink: url,
          userFirstName: user.name || user.email.split('@')[0], // Fallback for userFirstName
        }),
      })
    },
  },
  emailVerification: {
    // If you enable email verification, make sure `changeEmail.requireVerification` is true
    enabled: false, // Set to `true` to enable email verification flow
    sendVerificationEmail: async ({ user, url }) => {
      if (!user.email) {
        console.error('Verification email failed: User email is missing.')
        return
      }
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd', // Ensure this is a verified sender in Resend
        subject: 'Verify your email for Smart Clinic App', // More specific subject
        text: `Hello ${user.name || ''},\n\nPlease click on this link to verify your email address for Smart Clinic App: ${url}\n\nIf you did not request this, please ignore this email.`, // Better text content
      })
    },
  },
  rateLimit: {
    enabled: true,
    storage: 'database', // Uses Prisma for storage
  },
  appName: 'Smart Clinic App', // Used in various parts, like 2FA issuer
  plugins: [
    twoFactor({
      issuer: 'Smart Clinic App', // Use appName or specific issuer
      otpOptions: {
        async sendOTP({ user, otp }) {
          if (!user.email) {
            console.error('2FA OTP email failed: User email is missing.')
            return
          }
          await resend.emails.send({
            to: user.email,
            from: 'no-reply@korabimeri.work.gd',
            subject: 'Your Smart Clinic App Login Verification Code',
            text: `Your login verification code is: ${otp}\n\nThis code is valid for 5 minutes. Do not share it with anyone.`, // More secure message
          })
        },
      },
    }),
    anonymous({
      onLinkAccount: async ({ newUser }) => {
        // When an anonymous user links an account, update their isAnonymous status
        await prisma.user.update({
          where: {
            id: newUser.user.id,
          },
          data: {
            isAnonymous: false,
          },
        })
      },
    }),
    passkey({
      // IMPORTANT: Adjust rpID and origin for production deployment
      // rpID should be your domain (e.g., 'your-app.com')
      // origin should be your full URL (e.g., 'https://your-app.com')
      rpID: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'localhost',
      rpName: 'Smart Clinic App', // User-friendly name displayed during passkey registration
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', // Matches your frontend URL
    }),
    multiSession(), // Enables multiple concurrent sessions for a user
    admin({
      ac, // AccessControl instance
      roles: allRoles, // Array of defined roles
    }),
    nextCookies(),
  ],
})

// Memoized session retrieval for React Server Components, Layouts, etc.
// This is typically what you'd import and use in server-side Next.js code.
export const getServerSession = cache(async () => {
  return await auth.api.getSession({
    // headers() returns ReadonlyHeaders, which can be passed directly.
    headers: await headers(),
  })
})
export const getSession = getServerSession
// Type exports for convenience
export type Session = typeof auth.$Infer.Session
export type User = Session['user']
// Assuming 'role' is a string on your User type, otherwise specify its actual type.
export type Role = User['role']

// --------------------------------------------------------------------------
// Default Export
// This is crucial for the @better-auth/cli tool to find your configuration.
// --------------------------------------------------------------------------
export default { auth }
