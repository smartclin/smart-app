// src/routes/auth.tsx
// Layout route for /auth/* (sign-in, sign-up, forgot-password, reset-password)
// Redirects already-authenticated users to the dashboard
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Baby, Heart } from "lucide-react";
import { z } from "zod";

import { getSession } from "#/lib/auth-functions";

const authSearchSchema = z.object({
	redirect: z.string().optional().default("/dashboard")
});

export const Route = createFileRoute("/auth")({
	component: AuthLayout,
	validateSearch: authSearchSchema,
	beforeLoad: async ({ search }) => {
		const session = await getSession();
		if (session) {
			throw redirect({ to: search.redirect });
		}
	}
});

function AuthLayout() {
	return (
		<div className='flex min-h-screen'>
			{/* Left side - Brand/Info Panel */}
			<div className='hidden flex-1 flex-col justify-between bg-linear-to-br from-blue-600 via-teal-600 to-green-600 p-8 text-white lg:flex'>
				<div className='flex items-center gap-2'>
					<Baby className='h-8 w-8' />
					<span className='font-bold text-xl'>Smart Clinic</span>
					<Heart className='ml-2 h-5 w-5' />
				</div>

				<div className='space-y-6'>
					<h1 className='font-bold text-4xl leading-tight'>
						Welcome to
						<br />
						Pediatric Care
					</h1>
					<p className='max-w-md text-blue-100 text-lg'>
						Compassionate, expert care for your little ones. Access medical records, schedule appointments,
						and track growth milestones.
					</p>

					<div className='space-y-4'>
						<div className='flex items-center gap-3'>
							<div className='rounded-full bg-white/20 p-2'>
								<Heart className='h-5 w-5' />
							</div>
							<span>24/7 Emergency Support</span>
						</div>
						<div className='flex items-center gap-3'>
							<div className='rounded-full bg-white/20 p-2'>
								<Baby className='h-5 w-5' />
							</div>
							<span>Certified Pediatric Specialists</span>
						</div>
						<div className='flex items-center gap-3'>
							<div className='rounded-full bg-white/20 p-2'>
								<svg
									className='h-5 w-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<title>Check</title>
									<path
										d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
									/>
								</svg>
							</div>
							<span>Digital Health Records</span>
						</div>
					</div>
				</div>

				<div className='text-blue-100 text-sm'>
					<p>© 2025 Smart Clinic. All rights reserved.</p>
					<p className='mt-1'>Your child's health journey starts here.</p>
				</div>
			</div>

			{/* Right side - Auth Forms */}
			<div className='flex flex-1 items-center justify-center bg-gray-50 p-8'>
				<div className='w-full max-w-md'>
					<Outlet />
				</div>
			</div>
		</div>
	);
}
