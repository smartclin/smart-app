// components/sentry-error-boundary.tsx
import * as Sentry from "@sentry/tanstackstart-react";
import { withErrorBoundary } from "@sentry/tanstackstart-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

class SentryErrorBoundaryClass extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Manual capture for errors caught by this boundary
		Sentry.captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack
				}
			}
		});
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className='flex min-h-100 items-center justify-center p-6'>
					<Card className='max-w-md'>
						<CardHeader>
							<CardTitle className='text-destructive'>Something went wrong</CardTitle>
							<CardDescription>
								We've been notified about this issue and are working to fix it.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground text-sm'>
								Please try refreshing the page. If the problem persists, contact support.
							</p>
						</CardContent>
						<CardFooter className='flex gap-4'>
							<Button onClick={() => window.location.reload()}>Refresh Page</Button>
							<Button
								onClick={() => {
									this.setState({ hasError: false });
									window.location.href = "/dashboard";
								}}
								variant='outline'
							>
								Go to Dashboard
							</Button>
						</CardFooter>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

// Wrap with Sentry's withErrorBoundary HOC
export const SentryErrorBoundary = withErrorBoundary(SentryErrorBoundaryClass, {
	fallback: <p>An unexpected error occurred.</p>,
	onError: error => {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Error caught by boundary:", message);
		Sentry.addBreadcrumb({
			category: "error-boundary",
			message: `Error caught: ${message}`,
			level: "error"
		});
	}
});
