import { ORPCError, os } from "@orpc/server";
import { z } from "zod";

import { db } from "#/db";
import { auth } from "#/lib/auth";

import type { Context, OrpcContext } from "./context";

// Define base with proper Context type
export const base = os.$context<Context>().errors({
	UNAUTHORIZED: {
		message: "Unauthorized access",
		statusCode: 401
	},
	RATE_LIMITED: {
		data: z.object({ retryAfter: z.number() }),
		message: "You are being rate limited",
		statusCode: 429
	}
});

// Helper to get session data consistently
async function getSessionData(headers: Headers) {
	const sessionData = await auth.api.getSession({ headers });

	if (!sessionData?.session || !sessionData?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	return sessionData;
}

// Public DB middleware (no auth required)
export const dbMiddleware = base.middleware(async ({ next, context }) => {
	return next({
		context: {
			...context,
			db
		}
	});
});

// Enhanced auth middleware with better error handling
export const authMiddleware = base.middleware(async ({ context, next }) => {
	// Ensure headers exist (works with both server and client contexts)
	const headers = context.headers ?? new Headers();
	const sessionData = await getSessionData(headers);

	const requireRole = (role: string) => {
		if (sessionData.user.role !== role) {
			throw new ORPCError("FORBIDDEN", {
				message: `Role ${role} required, got ${sessionData.user.role}`
			});
		}
	};

	// Build enriched context
	const enrichedContext: OrpcContext = {
		db: context.db ?? db,
		auth,
		session: sessionData.session,
		user: sessionData.user,
		clinic: sessionData.user.primaryClinic ?? null,
		clinicId: sessionData.user.primaryClinic?.id ?? "",
		isAuthenticated: true,
		ip: headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? undefined,
		userAgent: headers.get("user-agent") ?? undefined,
		headers,
		requireRole
	};

	return next({
		context: enrichedContext
	});
});

// Fixed: Role-specific middleware using base directly
// Updated role middleware to support multiple roles
export function requireRoleMiddleware(requiredRoles: string[]) {
	return base.middleware(async ({ context, next }) => {
		const ctx = context as OrpcContext;
		if (!ctx.user || !requiredRoles.includes(ctx.user.role ?? "")) {
			throw new ORPCError("FORBIDDEN", {
				message: `One of roles [${requiredRoles.join(", ")}] required`
			});
		}
		return next({ context });
	});
}

// Export pre‑configured bases
export const publicProcedure = base.use(dbMiddleware);
export const authorizedProcedure = base.use(authMiddleware);
export const protectedProcedure = authorizedProcedure.use(dbMiddleware);

// Fixed: Create admin and staff procedures properly
// These should use authMiddleware first, then check roles
export const adminProcedure = base.use(authMiddleware).use(requireRoleMiddleware(["admin"]));

export const clinicProcedure = base.use(authMiddleware).use(requireRoleMiddleware(["doctor", "staff", "admin"]));

export const rateLimit = base.middleware(async ({ next }) => {
	throw new ORPCError("RATE_LIMITED", {
		message: "You are being rate limited",
		data: { retryAfter: 60 }
	});
	return next();
});

export function retry(options: { times: number }) {
	/**
	 * Best practices for dedupe-middlewares
	 * {@link https://orpc.dev/docs/best-practices/dedupe-middleware}
	 */
	return os.$context<{ canRetry?: boolean }>().middleware(({ context, next }) => {
		const canRetry = context.canRetry ?? true;

		if (!canRetry) {
			return next();
		}

		let times = 0;
		while (true) {
			try {
				return next({
					context: {
						canRetry: false
					}
				});
			} catch (e) {
				if (times >= options.times) {
					throw e;
				}

				times++;
			}
		}
	});
}
/* example for rate limit middleware
export const rateLimit = base
.use(rateLimit)
.errors({
  NOT_FOUND: {
    message: "Resource not found",
    statusCode: 404,
  },
})
.middleware(async ({ next }) => {
  // Implement your rate limiting logic here (e.g., using Redis or in-memory store)
  const isRateLimited = false; // Replace with actual check

  if (isRateLimited) {
    throw new ORPCError("RATE_LIMITED", {
      message: "You are being rate limited",
      data: { retryAfter: 60 }, // Example: retry after 60 seconds
    });
  }
  return next();
})
*/
