import z from 'zod'

import { createTRPCRouter, protectedProcedure } from '../init'

const roleSchema = z.enum(['patient', 'doctor', 'admin', 'staff'])

export const authRouter = createTRPCRouter({
	getSession: protectedProcedure.query(async ({ ctx }) => {
		const { session, user } = ctx.session

		return { session, user }
	}),

	// Get current user role as lowercase string, default to "patient"
	getRole: protectedProcedure.query(({ ctx }) => {
		const role = ctx.session?.user?.role?.toLowerCase() || 'patient'
		return role
	}),

	// Check if current user has a specific role
	checkRole: protectedProcedure.input(roleSchema).query(({ input: role, ctx }) => {
		const userRole = ctx.session?.user?.role?.toLowerCase()
		return userRole === role.toLowerCase()
	}),
})
