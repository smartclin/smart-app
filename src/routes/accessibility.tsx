// src/routes/accessibility.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, CheckCircle, Eye, FileText, Globe, Keyboard, Monitor, Volume2 } from "lucide-react";

export const Route = createFileRoute("/accessibility")({
	component: AccessibilityPage
});

function AccessibilityPage() {
	const commitments = [
		{
			icon: Eye,
			title: "Visual Accessibility",
			features: [
				"High contrast mode support",
				"Screen reader compatibility",
				"Adjustable text sizing",
				"Alternative text for images",
				"Color-blind friendly design"
			]
		},
		{
			icon: Keyboard,
			title: "Keyboard Navigation",
			features: [
				"Full keyboard accessibility",
				"Skip navigation links",
				"Focus indicators",
				"Logical tab order",
				"No keyboard traps"
			]
		},
		{
			icon: Monitor,
			title: "Responsive Design",
			features: [
				"Mobile-friendly layout",
				"Zoom support up to 200%",
				"Responsive tables",
				"Touch-friendly interfaces",
				"Consistent layout across devices"
			]
		},
		{
			icon: Volume2,
			title: "Hearing Accessibility",
			features: [
				"Captioning for video content",
				"Transcripts for audio content",
				"Visual alternatives for alerts",
				"Compatible with hearing devices"
			]
		}
	];

	const standards = [
		"WCAG 2.1 Level AA compliant",
		"Section 508 compliant",
		"WAI-ARIA implementation",
		"HTML5 semantic elements",
		"Regular accessibility audits"
	];

	return (
		<div className='min-h-screen bg-gray-50 py-12'>
			<div className='container mx-auto max-w-4xl px-4'>
				{/* Header */}
				<div className='mb-8 text-center'>
					<div className='mb-4 inline-flex rounded-full bg-teal-100 p-3'>
						<Accessibility className='h-8 w-8 text-teal-600' />
					</div>
					<h1 className='mb-2 font-bold text-3xl text-gray-900'>Accessibility Statement</h1>
					<p className='text-gray-600'>Committed to making our healthcare services accessible to everyone</p>
					<p className='mt-2 text-gray-500 text-sm'>Last updated: January 15, 2024</p>
				</div>

				{/* Commitment Statement */}
				<div className='mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6'>
					<h2 className='mb-3 font-semibold text-blue-900 text-xl'>Our Commitment</h2>
					<p className='text-blue-800'>
						Smart Clinic Pediatric Care is dedicated to ensuring that our website, patient portal, and
						digital services are accessible to all individuals, including those with disabilities. We strive
						to provide an inclusive experience that respects the dignity and independence of all our
						patients and their families.
					</p>
				</div>

				{/* Standards Compliance */}
				<div className='mb-8 rounded-lg border bg-white p-6 shadow-sm'>
					<div className='mb-4 flex items-center gap-3'>
						<Globe className='h-6 w-6 text-teal-600' />
						<h2 className='font-semibold text-gray-900 text-xl'>Standards Compliance</h2>
					</div>
					<div className='grid gap-3 sm:grid-cols-2'>
						{standards.map((standard, index) => (
							<div
								className='flex items-center gap-2'
								key={index}
							>
								<CheckCircle className='h-4 w-4 text-teal-500' />
								<span className='text-gray-700'>{standard}</span>
							</div>
						))}
					</div>
				</div>

				{/* Accessibility Features */}
				<div className='mb-8'>
					<h2 className='mb-4 font-semibold text-gray-900 text-xl'>Accessibility Features</h2>
					<div className='grid gap-6 md:grid-cols-2'>
						{commitments.map((feature, index) => (
							<div
								className='rounded-lg border bg-white p-5 shadow-sm'
								key={index}
							>
								<div className='mb-3 flex items-center gap-2'>
									<feature.icon className='h-5 w-5 text-teal-600' />
									<h3 className='font-semibold text-gray-900'>{feature.title}</h3>
								</div>
								<ul className='space-y-2'>
									{feature.features.map((item, itemIndex) => (
										<li
											className='flex items-start gap-2 text-gray-600 text-sm'
											key={itemIndex}
										>
											<span className='mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-teal-400' />
											{item}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Browser Compatibility */}
				<div className='mb-8 rounded-lg border bg-white p-6 shadow-sm'>
					<div className='mb-4 flex items-center gap-3'>
						<Monitor className='h-6 w-6 text-teal-600' />
						<h2 className='font-semibold text-gray-900 text-xl'>Browser & Device Support</h2>
					</div>
					<p className='mb-4 text-gray-700'>
						Our website is optimized for the following browsers and devices:
					</p>
					<div className='flex flex-wrap gap-3'>
						{["Chrome", "Firefox", "Safari", "Edge", "iOS", "Android"].map(browser => (
							<span
								className='rounded-full bg-gray-100 px-3 py-1 text-gray-700 text-sm'
								key={browser}
							>
								{browser}
							</span>
						))}
					</div>
				</div>

				{/* Feedback Section */}
				<div className='mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6'>
					<div className='flex flex-col items-center text-center'>
						<FileText className='mb-3 h-8 w-8 text-yellow-700' />
						<h2 className='mb-2 font-semibold text-xl text-yellow-900'>Feedback & Assistance</h2>
						<p className='mb-4 text-yellow-800'>
							We value your feedback. If you experience any difficulty accessing our services, please let
							us know.
						</p>
						<div className='flex flex-col gap-3 sm:flex-row'>
							<a
								className='text-yellow-800 hover:underline'
								href='mailto:accessibility@smartclinic.com'
							>
								accessibility@smartclinic.com
							</a>
							<span className='hidden text-yellow-600 sm:inline'>|</span>
							<a
								className='text-yellow-800 hover:underline'
								href='tel:+15551234567'
							>
								(555) 123-4567
							</a>
						</div>
					</div>
				</div>

				{/* Ongoing Efforts */}
				<div className='rounded-lg border bg-white p-6 shadow-sm'>
					<h2 className='mb-3 font-semibold text-gray-900 text-lg'>Ongoing Accessibility Efforts</h2>
					<p className='text-gray-700'>
						We are continuously working to improve the accessibility of our digital services. This includes:
					</p>
					<ul className='mt-3 space-y-2 pl-4'>
						<li className='flex items-start gap-2'>
							<CheckCircle className='mt-0.5 h-4 w-4 text-teal-500' />
							<span className='text-gray-700'>Regular accessibility audits and testing</span>
						</li>
						<li className='flex items-start gap-2'>
							<CheckCircle className='mt-0.5 h-4 w-4 text-teal-500' />
							<span className='text-gray-700'>Staff training on accessibility best practices</span>
						</li>
						<li className='flex items-start gap-2'>
							<CheckCircle className='mt-0.5 h-4 w-4 text-teal-500' />
							<span className='text-gray-700'>Partnering with accessibility experts</span>
						</li>
						<li className='flex items-start gap-2'>
							<CheckCircle className='mt-0.5 h-4 w-4 text-teal-500' />
							<span className='text-gray-700'>Incorporating user feedback into improvements</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
