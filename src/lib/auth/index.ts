import { PrismaClient } from '@prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin, anonymous, multiSession, twoFactor } from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
import { Resend } from 'resend'

import ResetPasswordEmail from '@/components/emals/reset-password'

import { ac, allRoles } from './roles'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      isAnonymous: { type: 'boolean', defaultValue: true },
      messageCount: { type: 'number', defaultValue: 0 },
      imageCount: { type: 'number', defaultValue: 0 },
      lastReset: { type: 'date' },
      role: { type: 'string', input: false },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
    },
    changeEmail: { enabled: true, requireVerification: false },
    deleteUser: { enabled: true, deleteSessions: true },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      if (!user.email) return
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd',
        subject: 'Reset your password for Smart Clinic App',
        react: ResetPasswordEmail({
          resetLink: url,
          userFirstName: user.name || user.email.split('@')[0],
        }),
      })
    },
  },
  emailVerification: {
    enabled: false,
    sendVerificationEmail: async ({ user, url }) => {
      if (!user.email) return
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd',
        subject: 'Verify your email for Smart Clinic App',
        text: `Hello ${user.name || ''},\n\nPlease click on this link to verify your email: ${url}`,
      })
    },
  },
  rateLimit: { enabled: true, storage: 'database' },
  appName: 'Smart Clinic App',
  plugins: [
    twoFactor({
      issuer: 'Smart Clinic App',
      otpOptions: {
        async sendOTP({ user, otp }) {
          if (!user.email) return
          await resend.emails.send({
            to: user.email,
            from: 'no-reply@korabimeri.work.gd',
            subject: 'Your Smart Clinic App Login Verification Code',
            text: `Your login verification code is: ${otp}`,
          })
        },
      },
    }),
    anonymous({
      onLinkAccount: async ({ newUser }) => {
        await prisma.user.update({
          where: { id: newUser.user.id },
          data: { isAnonymous: false },
        })
      },
    }),
    passkey({
      rpID: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'localhost',
      rpName: 'Smart Clinic App',
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    }),
    multiSession(),
    admin({ ac, roles: allRoles }),
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = Session['user']
export type Role = User['role']

export default { auth }
