// src/orpc/context.ts
import { ORPCError } from "@orpc/server";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { type AppDb, db } from "#/db";
import { type AuthSession, auth, type Clinic } from "#/lib/auth";

import type { UserRole } from "../lib/permissions";

export type OrpcContext = {
	session: AuthSession["session"] | null;
	auth: typeof auth;
	user: AuthSession["user"] | null;
	clinicId: string;
	db: AppDb;
	isAuthenticated: boolean;
	clinic: AuthSession["user"]["primaryClinic"] | null;
	ip?: string;
	userAgent?: string;
	headers: Headers;
	requireRole: (role: UserRole) => void;
};

// Make this sync by receiving auth data as parameter
export function createContextSync(data: {
	session: AuthSession["session"] | null;
	user: AuthSession["user"] | null;
	clinic: AuthSession["user"]["primaryClinic"] | null;
	headers: Headers;
}): OrpcContext {
	return {
		db,
		auth,
		user: data.user,
		session: data.session,
		clinic: data.clinic,
		clinicId: data.user?.primaryClinic?.id ?? "",
		ip: data.headers.get("x-forwarded-for") ?? data.headers.get("x-real-ip") ?? undefined,
		userAgent: data.headers.get("user-agent") ?? undefined,
		isAuthenticated: !!data.user,
		headers: data.headers,
		requireRole: (role: UserRole) => {
			if (data.user?.role !== role) {
				throw new ORPCError("FORBIDDEN");
			}
		}
	};
}

// Keep async version for compatibility
export async function createContext(options: CreateContextOptions = {}): Promise<OrpcContext> {
	const headers = options.headers ?? getRequestHeaders();
	const data = await auth.api.getSession({ headers });

	return createContextSync({
		session: data?.session ?? null,
		user: data?.user ?? null,
		clinic: data?.user?.primaryClinic ?? null,
		headers
	});
}

export type CreateContextOptions = {
	request?: Request; // Optional request object for server context
	headers?: Headers;
	clinic?: Clinic; // Optional override for clinicId, if needed in special cases
};

export type Context = Awaited<ReturnType<typeof createContext>>;
