import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env";
import type { auth } from "@/lib/auth";

import { ac, admin, doctor, patient, staff } from "./permissions";

export const authClient = createAuthClient({
	baseURL: env.VITE_BASE_URL,
	plugins: [
		adminClient({
			ac,
			roles: { staff, admin, patient, doctor }
		}),
		inferAdditionalFields<typeof auth>()
	]
});

export type Session = typeof authClient.$Infer.Session;

export const { signIn, signOut, useSession } = authClient;
