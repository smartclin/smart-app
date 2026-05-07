import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

import { auth } from "./auth";

type GetUserServerQuery = {
	disableCookieCache?: boolean | undefined;
	disableRefresh?: boolean | undefined;
};

/**
 * Shared logic for session retrieval.
 * Kept as a standard function to avoid TanStack Start compiler collisions.
 */
async function fetchSessionInternal(query?: GetUserServerQuery) {
	const request = getRequest();

	const session = await auth.api.getSession({
		headers: request.headers,
		query,
		returnHeaders: true
	});

	// Forward Set-Cookie headers (essential for Better Auth session management)
	const cookies = session.headers?.getSetCookie();
	if (cookies?.length) {
		setResponseHeader("Set-Cookie", cookies);
	}

	return session;
}

export const $getUser = createServerFn({ method: "GET" }).handler(async () => {
	const session = await fetchSessionInternal();
	return session.response?.user ?? null;
});

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
	const session = await fetchSessionInternal();
	return session.response;
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
	const session = await fetchSessionInternal();

	if (!session.response) {
		throw new Error("Unauthorized");
	}

	return session.response;
});
