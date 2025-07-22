import { ArrowRight, HeartPulse } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { MotionDiv, MotionSpan } from '@/components/motionDev'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/auth-client'
import { trpc } from '@/trpc/react'

export default function Hero({
	siteMetadata,
}: {
	siteMetadata: { name: string; description: string }
}) {
	const router = useRouter()
	const { data: session, isPending } = useSession()
	const healthStatus = trpc.healthCheck.useQuery()

	useEffect(() => {
		if (session?.user?.role) {
			router.push(`/${session.user.role}`)
		}
	}, [session, router])

	// Optional loading UI
	if (isPending === true) {
		return <div className="flex h-screen items-center justify-center">Loading...</div>
	}

	return (
		<div className="flex min-h-screen flex-col">
			<section className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28 lg:px-8">
				<div className="container relative z-10 mx-auto">
					<div className="flex flex-col items-center space-y-8 text-center">
						<MotionDiv
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-1 flex-col items-center justify-center px-4 md:px-8"
							initial={{ opacity: 0, y: 60 }}
							transition={{ duration: 0.7, ease: 'easeOut' }}
						>
							<div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
								<span className="flex items-center gap-2">
									<HeartPulse className="h-4 w-4" />
									Caring for Every Child, Every Step
								</span>
							</div>
							<h1 className="font-extrabold text-4xl text-foreground leading-tight tracking-tight md:text-6xl">
								Welcome to <span className="text-primary-500">{siteMetadata.name}</span>
								<br />
								<MotionSpan
									animate={{ scale: 1, opacity: 1 }}
									className="mt-3 block text-5xl text-blue-700 md:text-6xl lg:text-7xl"
									initial={{ scale: 0.95, opacity: 0 }}
									transition={{ duration: 1, delay: 0.4, type: 'spring' }}
								>
									Modern Pediatric Clinic Management
								</MotionSpan>
							</h1>
							<p className="mt-4 text-gray-700 text-lg leading-relaxed sm:text-xl dark:text-gray-300">
								{siteMetadata.description}
							</p>
						</MotionDiv>

						{/* API Status */}
						<section className="rounded-lg border p-4">
							<h2 className="mb-2 font-medium">API Status</h2>
							<div className="flex items-center gap-2">
								<div
									className={`h-2 w-2 rounded-full ${
										healthStatus.isLoading
											? 'bg-yellow-400'
											: healthStatus.data
												? 'bg-green-500'
												: 'bg-red-500'
									}`}
								/>
								<span className="text-muted-foreground text-sm">
									{healthStatus.isLoading
										? 'Checking...'
										: healthStatus.data
											? 'Connected'
											: 'Disconnected'}
								</span>
							</div>
						</section>

						{/* Action Buttons */}
						<MotionDiv
							animate={{ opacity: 1, y: 0 }}
							className="mt-8 flex flex-col gap-4 sm:flex-row"
							initial={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							{session?.user ? (
								<Link href={`/${session.user.role}`}>
									<Button
										className="w-full rounded-full bg-primary-600 px-8 py-3 font-semibold text-lg text-white shadow-md transition-all hover:scale-105 hover:bg-primary-700 hover:shadow-lg sm:w-auto"
										size="lg"
									>
										<span className="flex items-center">
											Go to Dashboard
											<ArrowRight className="ml-2 h-5 w-5" />
										</span>
									</Button>
								</Link>
							) : (
								<>
									<Link href="/signin">
										<Button
											className="w-full rounded-full bg-primary-600 px-8 py-3 font-semibold text-lg text-white shadow-md transition-all hover:scale-105 hover:bg-primary-700 hover:shadow-lg sm:w-auto"
											size="lg"
										>
											<span className="flex items-center">
												Log In to Patient Portal
												<ArrowRight className="ml-2 h-5 w-5" />
											</span>
										</Button>
									</Link>
									<Link href="/signup">
										<Button
											className="w-full rounded-full border-primary-600 px-8 py-3 font-semibold text-lg text-primary-600 shadow-md transition-all hover:scale-105 hover:bg-primary-50 hover:shadow-lg sm:w-auto dark:hover:bg-gray-700"
											size="lg"
											variant="outline"
										>
											New Patient Registration
										</Button>
									</Link>
								</>
							)}
						</MotionDiv>
					</div>
				</div>
			</section>
		</div>
	)
}
