// components/Footer.tsx
import { Link } from "@tanstack/react-router";
import { Activity, ArrowUp, Baby, Heart, Mail, MapPin, Phone, Shield, X as Twitter } from "lucide-react";
import { useEffect, useState } from "react";

import { Icons } from "./icons";

export default function Footer() {
	const year = new Date().getFullYear();
	const [showScrollTop, setShowScrollTop] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setShowScrollTop(window.scrollY > 500);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const footerLinks = {
		"Quick Links": [
			{ label: "Dashboard", href: "/dashboard" },
			{ label: "Patients", href: "/dashboard/patients" },
			{ label: "Appointments", href: "/dashboard/appointments" },
			{ label: "Growth Tracking", href: "/dashboard/growth" },
			{ label: "Immunizations", href: "/dashboard/immunizations" }
		],
		Resources: [
			{ label: "About Us", href: "/about" },
			{ label: "Contact", href: "/contact" },
			{ label: "Support", href: "/support" },
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Terms of Service", href: "/terms" }
		],
		"Get in Touch": [
			{ label: "support@smartclinic.com", href: "mailto:support@smartclinic.com", icon: Mail },
			{ label: "+1 (555) 123-4567", href: "tel:+15551234567", icon: Phone },
			{ label: "123 Medical Center Dr, Suite 100", href: "#", icon: MapPin }
		]
	};

	return (
		<footer className='relative mt-20 border-(--line) border-t bg-linear-to-b from-(--bg-base) to-(--foam)'>
			{/* Scroll to top button */}
			{showScrollTop && (
				<button
					aria-label='Scroll to top'
					className='fixed right-8 bottom-8 z-40 rounded-full bg-teal-500 p-3 text-white shadow-lg transition-all hover:scale-110 hover:bg-teal-600'
					onClick={scrollToTop}
					type='button'
				>
					<ArrowUp className='h-5 w-5' />
				</button>
			)}

			{/* Main Footer Content */}
			<div className='page-wrap px-4 py-12'>
				<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5'>
					{/* Brand Column */}
					<div className='lg:col-span-2'>
						<Link
							className='mb-4 inline-flex items-center gap-2'
							to='/'
						>
							<div className='rounded-full bg-teal-100 p-2 dark:bg-teal-900'>
								<Baby className='h-6 w-6 text-teal-600 dark:text-teal-400' />
							</div>
							<div>
								<span className='font-bold text-(--sea-ink) text-xl'>Smart Clinic</span>
								<p className='text-(--sea-ink-soft) text-xs'>Pediatric Care Excellence</p>
							</div>
						</Link>
						<p className='mb-4 text-(--sea-ink-soft) text-sm'>
							Providing compassionate, comprehensive pediatric care for children of all ages. Your child's
							health and well-being is our top priority.
						</p>
						<div className='flex items-center gap-4'>
							<div className='flex items-center gap-2'>
								<Shield className='h-4 w-4 text-teal-500' />
								<span className='text-(--sea-ink-soft) text-xs'>HIPAA Compliant</span>
							</div>
							<div className='flex items-center gap-2'>
								<Activity className='h-4 w-4 text-teal-500' />
								<span className='text-(--sea-ink-soft) text-xs'>24/7 Emergency Care</span>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className='mb-4 font-semibold text-(--sea-ink)'>Quick Links</h3>
						<ul className='space-y-2'>
							{footerLinks["Quick Links"].map(link => (
								<li key={link.label}>
									<Link
										className='text-(--sea-ink-soft) text-sm transition hover:pl-1 hover:text-teal-500'
										to={link.href}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h3 className='mb-4 font-semibold text-(--sea-ink)'>Resources</h3>
						<ul className='space-y-2'>
							{footerLinks.Resources.map(link => (
								<li key={link.label}>
									<Link
										className='text-(--sea-ink-soft) text-sm transition hover:pl-1 hover:text-teal-500'
										to={link.href}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h3 className='mb-4 font-semibold text-(--sea-ink)'>Get in Touch</h3>
						<ul className='space-y-3'>
							{footerLinks["Get in Touch"].map(link => (
								<li key={link.label}>
									<a
										className='flex items-center gap-2 text-(--sea-ink-soft) text-sm transition hover:text-teal-500'
										href={link.href}
										rel={link.label.includes("@") ? "noopener noreferrer" : undefined}
										target={link.label.includes("@") ? "_blank" : undefined}
									>
										<link.icon className='h-4 w-4 shrink-0' />
										<span>{link.label}</span>
									</a>
								</li>
							))}
						</ul>

						{/* Social Links */}
						<div className='mt-6'>
							<h4 className='mb-3 font-semibold text-(--sea-ink) text-sm'>Follow Us</h4>
							<div className='flex gap-3'>
								<a
									aria-label='Follow on X'
									className='rounded-full bg-gray-100 p-2 text-(--sea-ink-soft) transition hover:bg-teal-500 hover:text-white dark:bg-gray-800'
									href='https://x.com'
									rel='noopener noreferrer'
									target='_blank'
								>
									<Twitter className='h-4 w-4' />
								</a>
								<a
									aria-label='Follow on GitHub'
									className='rounded-full bg-gray-100 p-2 text-(--sea-ink-soft) transition hover:bg-teal-500 hover:text-white dark:bg-gray-800'
									href='https://github.com'
									rel='noopener noreferrer'
									target='_blank'
								>
									<Icons.github className='h-4 w-4' />
								</a>
								<a
									aria-label='Follow on LinkedIn'
									className='rounded-full bg-gray-100 p-2 text-(--sea-ink-soft) transition hover:bg-teal-500 hover:text-white dark:bg-gray-800'
									href='https://linkedin.com'
									rel='noopener noreferrer'
									target='_blank'
								>
									<svg
										className='h-4 w-4'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<title>LinkedIn</title>
										<path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z' />
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='mt-12 border-(--line) border-t pt-8'>
					<div className='flex flex-col items-center justify-between gap-4 text-center sm:flex-row'>
						<div>
							<p className='text-(--sea-ink-soft) text-sm'>
								&copy; {year} Smart Clinic Pediatric Care. All rights reserved.
							</p>
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-(--sea-ink-soft) text-xs'>Made with</span>
							<Heart className='h-3 w-3 animate-pulse text-red-500' />
							<span className='text-(--sea-ink-soft) text-xs'>for healthier children</span>
						</div>
						<div className='flex gap-4'>
							<Link
								className='text-(--sea-ink-soft) text-xs hover:text-teal-500'
								to='/privacy'
							>
								Privacy
							</Link>
							<Link
								className='text-(--sea-ink-soft) text-xs hover:text-teal-500'
								to='/terms'
							>
								Terms
							</Link>
							<Link
								className='text-(--sea-ink-soft) text-xs hover:text-teal-500'
								to='/accessibility'
							>
								Accessibility
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Decorative Wave */}
			<div className='absolute right-0 bottom-0 left-0 -z-10'>
				<svg
					className='h-32 w-full text-(--bg-base)'
					preserveAspectRatio='none'
					viewBox='0 0 1440 120'
				>
					<title>Wave</title>
					<path
						d='M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z'
						fill='currentColor'
					/>
				</svg>
			</div>
		</footer>
	);
}
