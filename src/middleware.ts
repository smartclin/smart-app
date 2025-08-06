// middleware.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getSession } from './lib/auth';
import { isValidUserRole, matchers } from './lib/routes'; // Assuming these are correctly defined and exported

/**
 * Main middleware function for authentication, authorization, and CORS.
 *
 * @param req The incoming Next.js request.
 * @returns A Next.js response (redirect, 204 for OPTIONS, or next).
 */
export async function middleware(req: NextRequest) {
    const { nextUrl, method } = req;
    const { pathname, origin } = nextUrl;

    // --- 1. CORS Preflight Handling (OPTIONS requests) ---
    // Handle preflight requests before any session or authorization checks,
    // as they don't carry cookies/auth headers and should be responded to quickly.
    if (method === 'OPTIONS') {
        const corsOrigin = process.env.CORS_ORIGIN || '*'; // Default to '*' for development/broad access
        const preflightHeaders = {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS', // Include all HTTP methods your API supports
            'Access-Control-Allow-Headers':
                'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
            'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
        };
        return new NextResponse(null, { headers: preflightHeaders, status: 204 }); // 204 No Content for successful preflight
    }

    // --- 2. Authentication & Authorization ---
    const matchedRoute = matchers.find(({ pattern }) => pattern.test(pathname));

    // Only proceed with session/role checks if the route is defined in `routeAccess`
    if (matchedRoute) {
        const session = await getSession(); // Ensure this is optimized internally (e.g., caching)
        const userRole = isValidUserRole(session?.user?.role) ? session.user.role : null;

        // Unauthorized (no role/not logged in)
        if (!userRole) {
            console.log(`[AUTH] Unauthenticated access to "${pathname}". Redirecting to /signin`);
            return NextResponse.redirect(new URL('/signin', origin));
        }

        // Forbidden (authenticated but incorrect role)
        if (!matchedRoute.allowedRoles.includes(userRole)) {
            console.warn(`[AUTH] User "${userRole}" attempted unauthorized access to "${pathname}". Redirecting to /${userRole}`);
            return NextResponse.redirect(new URL(`/${userRole}`, origin));
        }
    }

    // --- 3. CORS Headers for Actual API Responses ---
    const response = NextResponse.next();

    if (pathname.startsWith('/api') || pathname.startsWith('/trpc')) {
        const corsOrigin = process.env.CORS_ORIGIN || '*';
        const requestOrigin = req.headers.get('origin');

        // Dynamic CORS Origin for API/tRPC routes:
        // If CORS_ORIGIN is '*', allow any origin.
        // If CORS_ORIGIN is specific, but matches the request origin, allow it.
        // Otherwise, you might want to log or return an error, but here we default to the env variable.
        const allowedOrigin = corsOrigin === '*' ? requestOrigin || '*' : corsOrigin;

        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS'); // Reflect methods for actual response
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        // If your API uses specific custom headers (e.g., 'X-Custom-Header'), add them here if needed for client-side access
        // response.headers.set('Access-Control-Expose-Headers', 'X-Custom-Header');
    }

    return response;
}

export const config = {
    // This matcher config is already well-defined for broad coverage and exclusions.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*/static|.*\\..*).*)', // General pages, exclude static assets
        '/api/:path*', // All API routes
        '/trpc/:path*', // All tRPC routes
    ],
    // 'runtime': 'nodejs' is the default and good for typical Node.js environments.
    // Consider 'edge' if you need very low latency for global distribution (Vercel Edge Network).
    runtime: 'nodejs',
};