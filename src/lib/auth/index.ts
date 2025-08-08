import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, anonymous, multiSession, twoFactor } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { headers } from 'next/headers';
import { cache } from 'react';
import { Resend } from 'resend';

import ResetPasswordEmail from '@/components/emals/reset-password';

const resend = new Resend(process.env.RESEND_API_KEY);

import db from '@/db';

import { ac, allRoles } from './roles';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql'
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  // trustedOrigins: [process.env.CORS_ORIGIN || ''],
  user: {
    additionalFields: {
      isAnonymous: {
        type: 'boolean',
        required: false,
        defaultValue: true
      },
      messageCount: {
        type: 'number',
        required: false,
        defaultValue: 0
      },
      imageCount: {
        type: 'number',
        required: false,
        defaultValue: 0
      },
      lastReset: {
        type: 'date',
        required: false
      },
      role: {
        type: 'string',
        input: false
      },
      firstName: {
        type: 'string',
        required: false
      },
      lastName: {
        type: 'string',
        required: false
      }
    },
    changeEmail: {
      enabled: true,
      requireVerification: false
    },
    deleteUser: {
      enabled: true,
      deleteSessions: true
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd',
        subject: 'Reset your password',
        react: ResetPasswordEmail({
          resetLink: url,
          userFirstName: user.name
        })
      });
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        to: user.email,
        from: 'no-reply@korabimeri.work.gd',
        subject: 'Verify your email',
        text: `Click here to verify your email: ${url}`
      });
    }
  },
  rateLimit: {
    enabled: true,
    storage: 'database'
  },
  appName: 'Smart Clinic App',
  plugins: [
    twoFactor({
      issuer: 'APP_NAME',
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            to: user.email,
            from: 'no-reply@korabimeri.work.gd',
            subject: 'Your Login Verification Code',
            text: `Your login verification code is: ${otp}`
          });
        }
      }
    }),
    anonymous({
      onLinkAccount: async ({ newUser }) => {
        await db.user.update({
          where: {
            id: newUser.user.id
          },
          data: {
            isAnonymous: false
          }
        });
      }
    }),
    passkey({
      rpID: 'localhost',
      rpName: 'BetterAuth Demo',
      origin: 'http://localhost:3000'
    }),
    multiSession(),
    admin({
      ac,
      roles: allRoles
    }),
    nextCookies()
  ]
});

// Memoized session retrieval (used in layouts, middlewares, etc.)
export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers()
  });
});

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'];
export type Role = User['role'];

const authServer = auth.api;
export default authServer;
