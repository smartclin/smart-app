import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Award,
	Baby,
	Calendar,
	ClipboardCheck,
	Clock,
	Heart,
	Shield,
	Stethoscope,
	Syringe,
	TrendingUp,
	Users
} from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const stats = [
		{ icon: Users, value: "2,500+", label: "Happy Children", color: "text-blue-600" },
		{ icon: Stethoscope, value: "15+", label: "Expert Pediatricians", color: "text-teal-600" },
		{ icon: Calendar, value: "10,000+", label: "Appointments", color: "text-purple-600" },
		{ icon: Heart, value: "98%", label: "Parent Satisfaction", color: "text-pink-600" }
	];

	const features = [
		{
			icon: Baby,
			title: "Growth Tracking",
			description: "Monitor height, weight, and developmental milestones with WHO standards",
			color: "from-blue-500 to-cyan-500"
		},
		{
			icon: Syringe,
			title: "Immunization Schedule",
			description: "Never miss a vaccine with automated reminders and tracking",
			color: "from-green-500 to-emerald-500"
		},
		{
			icon: ClipboardCheck,
			title: "Digital Records",
			description: "Secure, accessible medical history for your child's entire journey",
			color: "from-purple-500 to-indigo-500"
		},
		{
			icon: Shield,
			title: "24/7 Support",
			description: "Emergency contacts and after-hours telemedicine consultations",
			color: "from-orange-500 to-red-500"
		}
	];

	const services = [
		{
			name: "Well-Child Visits",
			duration: "30-45 min",
			description: "Regular check-ups and developmental screening"
		},
		{ name: "Vaccinations", duration: "15-20 min", description: "Complete immunization programs" },
		{ name: "Sick Child Care", duration: "20-30 min", description: "Same-day appointments for acute illnesses" },
		{ name: "Developmental Assessments", duration: "45-60 min", description: "Growth milestones evaluation" },
		{ name: "Nutrition Counseling", duration: "30 min", description: "Dietary guidance for all ages" },
		{ name: "Telemedicine", duration: "15-20 min", description: "Virtual consultations from home" }
	];

	return (
		<main className='min-h-screen'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-linear-to-br from-blue-50 via-teal-50 to-green-50'>
				{/* Decorative elements */}
				<div className='absolute inset-0 overflow-hidden'>
					<div className='absolute -top-40 -right-40 h-96 w-96 rounded-full bg-linear-to-br from-blue-200/30 to-teal-200/30 blur-3xl' />
					<div className='absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-linear-to-br from-purple-200/30 to-pink-200/30 blur-3xl' />
				</div>

				<div className='relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<div className='mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2'>
							<Heart className='h-4 w-4 text-green-600' />
							<span className='font-medium text-green-700 text-sm'>
								Caring for little hearts since 2015
							</span>
						</div>

						<h1 className='mb-6 bg-linear-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text font-bold text-5xl text-transparent tracking-tight sm:text-7xl'>
							Welcome to Smart Clinic
						</h1>
						<p className='mx-auto mb-8 max-w-2xl text-gray-600 text-xl'>
							Compassionate pediatric care powered by modern technology. Your child's health journey
							starts here.
						</p>

						<div className='flex flex-wrap justify-center gap-4'>
							<Link
								className='inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-teal-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg'
								to='/dashboard'
							>
								<Stethoscope className='h-5 w-5' />
								Go to Dashboard
							</Link>
							<Link
								className='inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-teal-500 hover:bg-teal-50'
								to='/about'
							>
								<Calendar className='h-5 w-5' />
								Schedule Appointment
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className='border-gray-100 border-b bg-white py-12'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
						{stats.map((stat, index) => (
							<div
								className='text-center'
								key={index}
							>
								<div className='mb-3 flex justify-center'>
									<div className='rounded-full bg-gray-100 p-3'>
										<stat.icon className={`h-6 w-6 ${stat.color}`} />
									</div>
								</div>
								<p className='font-bold text-2xl text-gray-900'>{stat.value}</p>
								<p className='text-gray-600 text-sm'>{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-16'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='mb-12 text-center'>
						<h2 className='mb-4 font-bold text-3xl text-gray-900'>Why Choose Smart Clinic?</h2>
						<p className='mx-auto max-w-2xl text-gray-600'>
							We combine expert pediatric care with modern technology to provide the best experience for
							your family
						</p>
					</div>

					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						{features.map((feature, index) => (
							<div
								className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-xl'
								key={index}
							>
								<div
									className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-5`}
								/>
								<div className='relative'>
									<div className='mb-4 inline-flex rounded-lg bg-linear-to-br from-gray-100 to-gray-200 p-3 transition-transform group-hover:scale-110'>
										<feature.icon className='h-6 w-6 text-gray-700' />
									</div>
									<h3 className='mb-2 font-semibold text-gray-900 text-xl'>{feature.title}</h3>
									<p className='text-gray-600'>{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section className='bg-linear-to-br from-blue-50 via-teal-50 to-green-50 py-16'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='mb-12 text-center'>
						<h2 className='mb-4 font-bold text-3xl text-gray-900'>Our Services</h2>
						<p className='mx-auto max-w-2xl text-gray-600'>
							Comprehensive pediatric care tailored to your child's needs
						</p>
					</div>

					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{services.map((service, index) => (
							<div
								className='flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md'
								key={index}
							>
								<div className='shrink-0'>
									<div className='rounded-lg bg-green-100 p-2'>
										<Clock className='h-5 w-5 text-green-600' />
									</div>
								</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-gray-900'>{service.name}</h3>
									<p className='text-gray-500 text-sm'>{service.duration}</p>
									<p className='mt-1 text-gray-600 text-sm'>{service.description}</p>
								</div>
							</div>
						))}
					</div>

					<div className='mt-8 text-center'>
						<Link
							className='inline-flex items-center gap-2 rounded-lg border-2 border-teal-200 bg-white px-6 py-3 font-semibold text-teal-600 transition-all hover:bg-teal-50'
							to='/dashboard/appointments'
						>
							<Calendar className='h-5 w-5' />
							View All Services
							<TrendingUp className='h-4 w-4' />
						</Link>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-16'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-teal-600 p-8 text-center text-white shadow-xl md:p-12'>
						<div className='absolute inset-0 opacity-10'>
							<div className='absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white' />
							<div className='absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white' />
						</div>
						<button
							onClick={() => {
								throw new Error("Sentry Test Error");
							}}
							type='button'
						>
							Break the world
						</button>
						<div className='relative'>
							<h2 className='mb-4 font-bold text-3xl'>Ready to get started?</h2>
							<p className='mx-auto mb-8 max-w-2xl text-blue-100'>
								Join thousands of happy parents who trust us with their children's health
							</p>
							<div className='flex flex-wrap justify-center gap-4'>
								<Link
									className='inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-teal-600 transition-all hover:scale-105 hover:shadow-lg'
									to='/dashboard'
								>
									<Users className='h-5 w-5' />
									Register Your Child
								</Link>
								<Link
									className='inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-transparent px-6 py-3 font-semibold text-white transition-all hover:bg-white/10'
									to='/about'
								>
									<Heart className='h-5 w-5' />
									Learn More
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer Note */}
			<footer className='border-gray-200 border-t bg-white py-8'>
				<div className='mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
					<div className='flex items-center justify-center gap-2 text-gray-500 text-sm'>
						<Award className='h-4 w-4' />
						<span>Accredited Pediatric Care Center</span>
						<span className='mx-2'>•</span>
						<span>© 2025 Smart Clinic. All rights reserved.</span>
					</div>
				</div>
			</footer>
		</main>
	);
}
