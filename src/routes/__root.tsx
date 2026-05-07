import * as Sentry from "@sentry/tanstackstart-react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools, TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

import { SentryErrorBoundary } from "../components/ErrorBoundry";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<Outlet />
			{process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
		</>
	),
	notFoundComponent: () => <div>Page not found</div>, // Add this!

	head: () => ({
		meta: [
			{
				charSet: "utf-8"
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				title: "Smart Clinic App"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss
			}
		]
	}),
	shellComponent: RootDocument
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { data: session } = authClient.useSession();

	// ✅ Add Sentry user context here
	useEffect(() => {
		if (session?.user) {
			Sentry.setUser({
				id: session.user.id,
				email: session.user.email,
				name: session.user.name,
				role: session.user.role
			});

			Sentry.setTag("user_role", session.user.role);
			Sentry.setTag("user_id", session.user.id);
			if (session.user.clinicId) {
				Sentry.setTag("clinic_id", session.user.clinicId);
			}

			Sentry.setContext("user_details", {
				role: session.user.role,
				emailVerified: session.user.emailVerified,
				clinicId: session.user.clinicId
			});
		} else {
			Sentry.setUser(null);
		}
	}, [session]);
	return (
		<html
			lang='en'
			suppressHydrationWarning
		>
			<head>
				<script>{THEME_INIT_SCRIPT}</script>
				<HeadContent />
			</head>
			<body className='wrap-anywhere font-sans antialiased selection:bg-[rgba(79,184,178,0.24)]'>
				<Header />
				<SentryErrorBoundary>
					<TooltipProvider>{children}</TooltipProvider>
				</SentryErrorBoundary>
				<TanStackDevtools
					config={{
						position: "bottom-right"
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />
						},
						TanStackQueryDevtools
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
