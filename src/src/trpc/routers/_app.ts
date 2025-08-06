import db from '@/db'
import { chatsRouter } from '@/server/procedures/chats'
import { userRouter } from '@/server/procedures/user'
import {
	createCallerFactory,
	createTRPCContext,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/trpc/init'

import { adminRouter } from './Admin.router'
import { appointmentRouter } from './Appointment.router'
import { authRouter } from './auth.route'
import { doctorRouter } from './Doctor.router'
import { medicalRecordsRouter } from './MedicalRecords.router'
import { patientRouter } from './Patient.router'
import { paymentsRouter } from './Payment.router'
import { staffRouter } from './Staff.router'
import { vitalSignsRouter } from './VitalSigns.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	chats: chatsRouter,
	user: userRouter,
	healthCheck: publicProcedure.query(async () => {
		try {
			// Optional DB ping (replace with a lightweight model)
			await db.user.findFirst({ select: { id: true } }) // fast + safe query
			return true
		} catch (error) {
			console.error('Health check failed:', error)
			return false
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
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)

export const createContext = createTRPCContext
