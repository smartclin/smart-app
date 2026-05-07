// components/sentry-test-button.tsx

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SentryTestButton() {
	const triggerClientError = () => {
		try {
			throw new Error("Sentry Test Error - Client Side");
		} catch (error) {
			// This will be captured by Sentry automatically
			console.error(error);
			toast.error("Error sent to Sentry! Check your dashboard.");
		}
	};

	const triggerServerError = async () => {
		try {
			const response = await fetch("/api/test-error");
			if (!response.ok) throw new Error("Server error triggered");
		} catch (error) {
			Sentry.captureException(error);
			toast.error("Server error sent to Sentry!");
		}
	};

	return (
		<div className='space-y-4'>
			<h3 className='font-semibold'>Sentry Testing</h3>
			<div className='flex gap-4'>
				<Button
					onClick={triggerClientError}
					variant='destructive'
				>
					Test Client Error
				</Button>
				<Button
					onClick={triggerServerError}
					variant='outline'
				>
					Test Server Error
				</Button>
			</div>
			<p className='text-muted-foreground text-xs'>
				Check your Sentry dashboard for captured errors (may take a few moments)
			</p>
		</div>
	);
}
