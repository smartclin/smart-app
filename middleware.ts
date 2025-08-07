// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Assuming these are correctly defined and exported from your lib/routes.ts file
import { isValidUserRole, matchers } from "@/lib/routes";
import { getSession } from "@/lib/auth";

/**
 * A utility function to set CORS headers on a given response.
 * This prevents code duplication in the middleware.
 *
 * @param res The Next.js response to modify.
 * @param origin The allowed origin for the response.
 */
function setCorsHeaders(res: NextResponse, origin: string | null) {
  // Use a sensible default if the origin is not available
  const allowedOrigin = origin || "*";

  // These headers are for the actual response, not for preflight
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
  );
  // It's a good practice to explicitly list headers allowed by your API
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Api-Version"
  );
}

/**
 * Main middleware function for authentication, authorization, and CORS.
 *
 * @param req The incoming Next.js request.
 * @returns A Next.js response (redirect, 204 for OPTIONS, or next).
 */
export async function middleware(req: NextRequest) {
  const { nextUrl, method } = req;
  const { pathname, origin } = nextUrl;

  const corsOrigin = process.env.CORS_ORIGIN || "*";
  const requestOrigin = req.headers.get("origin");

  // --- 1. CORS Preflight Handling (OPTIONS requests) ---
  // Respond to OPTIONS requests with the full set of allowed headers
  if (method === "OPTIONS") {
    const preflightHeaders = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": corsOrigin, // The environment variable is the source of truth
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
      // Explicitly list all headers your API supports to avoid broad 'Content-Type' access
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Api-Version",
      "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
    };
    return new NextResponse(null, { headers: preflightHeaders, status: 204 });
  }

  // --- 2. Authentication & Authorization ---
  const matchedRoute = matchers.find(({ pattern }) => pattern.test(pathname));

  // Only run auth checks if the current path is defined in your `matchers`
  if (matchedRoute) {
    const session = await getSession();
    const userRole = isValidUserRole(session?.user?.role)
      ? session.user.role
      : null;

    // Redirect to signin if the user is not authenticated
    if (!userRole) {
      console.log(
        `[AUTH] Unauthenticated access to "${pathname}". Redirecting to /signin`
      );
      return NextResponse.redirect(new URL("/signin", origin));
    }

    // Redirect to user's dashboard if they are authenticated but lack the correct role
    if (!matchedRoute.allowedRoles.includes(userRole)) {
      console.warn(
        `[AUTH] User "${userRole}" attempted unauthorized access to "${pathname}". Redirecting to /${userRole}`
      );
      return NextResponse.redirect(new URL(`/${userRole}`, origin));
    }
  }

  // --- 3. Final Response with CORS Headers ---
  // Create a single response and attach CORS headers if the request is for an API route.
  const response = NextResponse.next();

  if (pathname.startsWith("/api") || pathname.startsWith("/trpc")) {
    setCorsHeaders(response, requestOrigin);
  }

  return response;
}

export const config = {
  // A single, robust matcher that applies the middleware to all paths
  // except for Next.js internal files and static assets.
  // This is a cleaner approach than having multiple matchers.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
  runtime: "nodejs",
};
