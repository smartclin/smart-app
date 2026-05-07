import * as Sentry from "@sentry/tanstackstart-react";

const sentryDsn = process.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
	console.warn("VITE_SENTRY_DSN is not defined. Sentry is not running.");
} else {
	Sentry.init({
		dsn: "https://1c84155f162b9eb8d60440b8b19affe7@o4508922438156288.ingest.us.sentry.io/4511344202416128",
		environment: process.env.NODE_ENV,
		release: process.env.VITE_GIT_COMMIT_SHA || "development",
		sampleRate: 1.0, // Capture 100% of errors in production
		attachStacktrace: true,
		tracePropagationTargets: ["localhost", /^https:\/\/your-api\.domain\.com/],
		// Session replay for debugging user interactions
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,

		// Profile performance
		profilesSampleRate: 0.5,

		// Breadcrumbs - track user actions before errors
		maxBreadcrumbs: 50,

		// Ignore common errors (e.g., network failures, third-party scripts)
		ignoreErrors: [
			/NetworkError/,
			/Failed to fetch/,
			/ResizeObserver loop/,
			/Non-Error promise rejection captured/
		],

		// Core options
		debug: process.env.NODE_ENV !== "production",
		enabled: process.env.NODE_ENV === "production",
		// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
		sendDefaultPii: true,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 1.0,
		replaysOnErrorSampleRate: 1.0,
		beforeSend(event, hint) {
			// Check if the error is an instance of a specific error type using hint
			if (hint.originalException instanceof Error && hint.originalException.message.includes("ignore")) {
				return null;
			}

			// Remove sensitive user data
			if (event.user) {
				delete event.user.email;
				delete event.user.ip_address;
			}

			// Remove sensitive headers
			if (event.request?.headers) {
				delete event.request.headers.authorization;
				delete event.request.headers["x-api-key"];
			}

			return event;
		}
	});
}
