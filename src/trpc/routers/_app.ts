import { chatsRouter } from '@/server/procedures/chats'
import { userRouter } from '@/server/procedures/user'
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/trpc/init'

import { adminRouter } from './admin.router'
import { appointmentRouter } from './appointment.router'
import { authRouter } from './auth.route'
import { doctorRouter } from './Doctor.router'
import { medicalRecordsRouter } from './MedicalRecords.router'
import { patientRouter } from './Patient.router'
import { paymentsRouter } from './Payment.router'
import { postRouter } from './post'
import { staffRouter } from './Staff.router'
import { vitalSignsRouter } from './VitalSigns.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  chats: chatsRouter,
  user: userRouter,
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    try {
      // Attempt to query the database to check connectivity
      const newUser = await ctx.db.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })

      return {
        status: 'ok',
        database: newUser ? 'connected' : 'no_users_found', // Indicate if users exist
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('TRPC Health Check failed:', error)
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.user,
    }
  }),
  vitalSigns: vitalSignsRouter,
  staff: staffRouter,
  payment: paymentsRouter,
  patient: patientRouter,
  medicalRecords: medicalRecordsRouter,
  doctor: doctorRouter,
  appointment: appointmentRouter,
  admin: adminRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 * ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)

export const createContext = createTRPCContext
