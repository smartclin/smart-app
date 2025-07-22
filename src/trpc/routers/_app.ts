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
	healthCheck: publicProcedure.query(async () => {
		return 'OK'
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
