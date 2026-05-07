import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import z from "zod";

import { user } from "../../db/schema";
import { auth } from "../../lib/auth";
import { adminProcedure, protectedProcedure, publicProcedure } from "../init";
import { UserCreateSchema } from "../schema";

const signUpSchema = UserCreateSchema.pick({ email: true }).extend({
	role: z.enum(["patient", "doctor"]),
	password: z.string().min(6),
	name: z.string()
});

export const signup = publicProcedure
	.route({
		method: "POST",
		path: "/auth/signup",
		summary: "User signup",
		tags: ["Auth"]
	})
	.input(signUpSchema)
	.handler(async ({ input, context }) => {
		const { email, password, role, name } = input;

		// Use signUpEmail for public registration (no admin required)
		const result = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name
			}
		});

		// Handle error response
		if (!result || "error" in result) {
			throw new ORPCError("RATE_LIMITED", {
				message: "You are being rate limited",
				data: { retryAfter: 60 }
			});
		}

		// Store custom role in separate table or metadata
		// Option 1: Update user with additional data (if you have a users table)
		await context.db.update(user).set({ role }).where(eq(user.id, result.user.id));

		return {
			id: result.user.id,
			email: result.user.email,
			name: result.user.name,
			role: role
		};
	});

export const signIn = publicProcedure
	.route({
		method: "POST",
		path: "/auth/signin",
		summary: "User signin",
		tags: ["Auth"]
	})
	.input(
		z.object({
			email: z.string().email(),
			password: z.string()
		})
	)
	.handler(async ({ input }) => {
		const { email, password } = input;

		const result = await auth.api.signInEmail({
			body: {
				email,
				password
			}
		});

		if (!result || "error" in result) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "Invalid email or password"
			});
		}

		return {
			id: result.user.id,
			email: result.user.email,
			name: result.user.name,
			role: result.user.role // Assuming role is included in the response
		};
	});

export const signOut = protectedProcedure
	.route({
		method: "POST",
		path: "/auth/signout",
		summary: "User signout",
		tags: ["Auth"]
	})
	.handler(async ({ context }) => {
		await auth.api.signOut({
			headers: context.headers
		});

		return { success: true };
	});

export const revokeAllUserSessions = adminProcedure
	.input(z.object({ userId: z.string() }))
	.handler(async ({ input, context }) => {
		await auth.api.revokeUserSessions({
			body: { userId: input.userId },
			headers: context.headers
		});
		return { success: true };
	});
