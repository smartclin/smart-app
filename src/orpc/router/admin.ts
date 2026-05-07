import z from "zod";

import { auth } from "#/lib/auth";

import { adminProcedure, publicProcedure } from "../init";
import { UserSchema } from "../schema";

export const UserAuthSchema = UserSchema.extend({
	role: z.enum(["admin", "doctor", "patient", "staff"]),
	password: z.string().min(6)
});
export const listUsers = adminProcedure.handler(async () => {
	const result = await auth.api.listUsers();
	return result.users;
});

export const updateUserRole = adminProcedure
	.input(
		z.object({
			userId: z.string(),
			role: z.enum(["admin", "doctor", "patient", "staff"])
		})
	)
	.handler(async ({ input, context }) => {
		const { userId, role } = input;

		const user = await auth.api.setRole({
			body: {
				userId,
				role
			},
			headers: context.headers
		});

		return user;
	});

export const createUser = publicProcedure
	.route({
		method: "POST",
		path: "/auth/signup",
		summary: "User signup",
		tags: ["Auth"]
	})
	.input(UserAuthSchema)
	.handler(async ({ input, context }) => {
		const { email, password, role, name } = input;

		// Requires Better Auth Admin plugin
		const newUser = await auth.api.createUser({
			body: {
				email,
				password,
				name,
				role, // Custom role stored in user record
				data: {
					// Additional metadata
					roleType: role
				}
			},
			headers: context.headers // Pass the request headers
		});

		return {
			id: newUser.user.id,
			email: newUser.user.email,
			name: newUser.user.name,
			role: role
		};
	});

export const banUser = adminProcedure.input(z.object({ userId: z.string() })).handler(async ({ input }) => {
	await auth.api.banUser({ body: { userId: input.userId } });
	return { success: true };
});

export const unbanUser = adminProcedure.input(z.object({ userId: z.string() })).handler(async ({ input }) => {
	await auth.api.unbanUser({ body: { userId: input.userId } });
	return { success: true };
});

export const removeUser = adminProcedure.input(z.object({ userId: z.string() })).handler(async ({ input }) => {
	await auth.api.removeUser({ body: { userId: input.userId } });
	return { success: true };
});

export const revokeAllUserSessions = adminProcedure
	.input(z.object({ userId: z.string() }))
	.handler(async ({ input }) => {
		await auth.api.revokeUserSessions({ body: { userId: input.userId } });
		return { success: true };
	});
