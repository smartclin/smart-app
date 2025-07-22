import { BabyIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import SignupForm from '@/app/(auth)/signup/signup-form'

export const metadata: Metadata = {
	title: 'Sign Up | PediaCare Clinic',
	description: 'Create your account to access the pediatric clinic portal.',
}

export default function SignupPage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-muted px-6 py-12 md:py-20">
			<section className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg dark:bg-background">
				<header className="flex flex-col items-center gap-2 text-center">
					<Link
						aria-label="PediaCare Home"
						className="flex flex-col items-center justify-center gap-1"
						href="/"
					>
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
							<BabyIcon className="size-6" />
						</div>
						<span className="font-semibold text-lg tracking-tight">PediaCare Clinic</span>
					</Link>
					<h1 className="font-bold text-xl">Create your account</h1>
					<p className="text-muted-foreground text-sm">
						Already have an account?{' '}
						<Link
							className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
							href="/signin"
						>
							Sign in
						</Link>
					</p>
				</header>

				<SignupForm />

				<p className="text-center text-muted-foreground text-xs">
					By continuing, you agree to our{' '}
					<Link
						className="underline hover:text-primary"
						href="/terms"
					>
						Terms of Service
					</Link>{' '}
					and{' '}
					<Link
						className="underline hover:text-primary"
						href="/privacy"
					>
						Privacy Policy
					</Link>
					.
				</p>
			</section>
		</main>
	)
}
