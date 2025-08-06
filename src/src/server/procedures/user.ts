import { TRPCError } from '@trpc/server'

import { db } from '@/db'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'

export const userRouter = createTRPCRouter({
	getCurrentUser: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new TRPCError({ code: 'UNAUTHORIZED' })
		}

		const user = await db.user.findUnique({
			where: {
				id: ctx.user.id,
			},
		})

		if (!user) throw new TRPCError({ code: 'NOT_FOUND' })

		return user
	}),
})
