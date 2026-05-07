// components/Header.tsx
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	Baby,
	Bell,
	Calendar,
	Heart,
	HelpCircle,
	LayoutDashboard,
	Menu,
	Pill,
	Search,
	Syringe,
	Users,
	X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [scrolled, setScrolled] = useState(false);
	const navigate = useNavigate();
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Handle scroll effect for sticky header styling
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Handle keyboard shortcut for search (Cmd+K or Ctrl+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setSearchOpen(true);
				searchInputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const navItems = useMemo(
		() => [
			{ title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, badge: null },
			{ title: "Patients", path: "/dashboard/patients", icon: Users, badge: null },
			{ title: "Appointments", path: "/dashboard/appointments", icon: Calendar, badge: null },
			{ title: "Growth Tracking", path: "/dashboard/growth", icon: Baby, badge: "New" },
			{ title: "Immunizations", path: "/dashboard/immunizations", icon: Syringe, badge: null },
			{ title: "Prescriptions", path: "/dashboard/prescriptions", icon: Pill, badge: null },
		],
		[]
	);

	const quickActions = [
		{ label: "New Patient", path: "/dashboard/patients/new", icon: Users },
		{ label: "New Appointment", path: "/dashboard/appointments/new", icon: Calendar },
		{ label: "Record Growth", path: "/dashboard/growth/record", icon: Activity },
		{ label: "Record Immunization", path: "/dashboard/immunizations/record", icon: Syringe }
	];

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate({ to: "/dashboard", search: { q: searchQuery } });
			setSearchOpen(false);
			setSearchQuery("");
		}
	};

	return (
		<TooltipProvider>
			<header
				className={`sticky top-0 z-50 transition-all duration-300 ${
					scrolled
						? "border-(--line) border-b bg-(--header-bg) shadow-lg backdrop-blur-lg"
						: "bg-(--header-bg) backdrop-blur-sm"
				} px-4`}
			>
				<nav className='page-wrap flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 sm:py-3'>
					{/* Logo */}
					<div className='flex items-center gap-2'>
						<h2 className='m-0 shrink-0 font-semibold text-base tracking-tight'>
							<Link
								className='group inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-(--sea-ink) text-sm no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] transition-all hover:scale-105 sm:px-4 sm:py-2'
								to='/'
							>
								<span className='relative flex h-2 w-2'>
									<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75' />
									<span className='relative inline-flex h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]' />
								</span>
								<span className='hidden font-semibold sm:inline'>Smart Clinic</span>
								<span className='font-semibold sm:hidden'>SC</span>
								<Heart className='h-3 w-3 text-teal-500 transition-transform group-hover:scale-110' />
							</Link>
						</h2>
					</div>

					{/* Search Bar - Desktop */}
					<div className='hidden max-w-md flex-1 md:block'>
						<form
							className='relative'
							onSubmit={handleSearch}
						>
							<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
							<Input
								className='border-(--chip-line) bg-(--chip-bg) pl-9 focus:border-teal-400'
								onChange={e => setSearchQuery(e.target.value)}
								placeholder='Search patients, appointments... (⌘K)'
								value={searchQuery}
							/>
							<kbd className='pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 select-none gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-muted-foreground text-xs opacity-100 sm:flex'>
								⌘K
							</kbd>
						</form>
					</div>

					{/* Desktop Navigation */}
					<div className='hidden items-center gap-1 md:flex'>
						{navItems.map(item => (
							<Tooltip key={item.path}>
								<TooltipTrigger asChild>
									<Link
										activeProps={{ className: "nav-link is-active bg-teal-50 dark:bg-teal-950/20" }}
										className='nav-link relative flex items-center gap-2 rounded-lg px-3 py-2 text-(--sea-ink-soft) transition-all hover:scale-105 hover:bg-(--link-bg-hover) hover:text-(--sea-ink)'
										to={item.path}
									>
										<item.icon className='h-4 w-4' />
										<span>{item.title}</span>
										{item.badge && (
											<Badge
												className='ml-1 text-xs'
												variant='secondary'
											>
												{item.badge}
											</Badge>
										)}
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<p>Go to {item.title}</p>
								</TooltipContent>
							</Tooltip>
						))}
					</div>

					{/* Right Side Actions */}
					<div className='flex items-center gap-1.5 sm:gap-2'>
						{/* Quick Actions Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className='relative'
									size='icon'
									variant='ghost'
								>
									<Activity className='h-5 w-5' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='end'
								className='w-56'
							>
								<DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{quickActions.map(action => (
									<DropdownMenuItem
										asChild
										key={action.path}
									>
										<Link
											className='flex cursor-pointer items-center gap-2'
											to={action.path}
										>
											<action.icon className='h-4 w-4' />
											<span>{action.label}</span>
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Notifications */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className='relative'
									size='icon'
									variant='ghost'
								>
									<Bell className='h-5 w-5' />
									<span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='end'
								className='w-80'
							>
								<DropdownMenuLabel className='flex items-center justify-between'>
									<span>Notifications</span>
									<Button
										className='text-xs'
										size='sm'
										variant='ghost'
									>
										Mark all as read
									</Button>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<div className='max-h-96 overflow-y-auto'>
									<NotificationItem
										description='John Doe has an appointment in 30 minutes'
										time='30 min ago'
										title='Appointment Reminder'
										type='appointment'
									/>
									<NotificationItem
										description='Blood test results for Sarah Johnson are available'
										time='2 hours ago'
										title='Lab Results Ready'
										type='lab'
									/>
									<NotificationItem
										description='MMR vaccine is overdue for Michael Brown'
										time='1 day ago'
										title='Overdue Immunization'
										type='vaccine'
									/>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									asChild
									className='justify-center'
								>
									<Link
										className='text-center'
										to='/dashboard'
									>
										View all notifications
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<BetterAuthHeader />
						<ThemeToggle />

						{/* Mobile Menu Button */}
						<Sheet
							onOpenChange={setMobileMenuOpen}
							open={mobileMenuOpen}
						>
							<SheetTrigger asChild>
								<Button
									className='md:hidden'
									size='icon'
									variant='ghost'
								>
									<Menu className='h-5 w-5' />
								</Button>
							</SheetTrigger>
							<SheetContent
								className='w-[85vw] max-w-[320px] p-0'
								side='right'
							>
								<div className='flex h-full flex-col'>
									{/* Mobile Header */}
									<div className='flex items-center justify-between border-b p-4'>
										<Link
											className='flex items-center gap-2 font-semibold text-lg'
											onClick={() => setMobileMenuOpen(false)}
											to='/'
										>
											<Baby className='h-5 w-5 text-teal-500' />
											<span>Smart Clinic</span>
										</Link>
										<Button
											onClick={() => setMobileMenuOpen(false)}
											size='icon'
											variant='ghost'
										>
											<X className='h-5 w-5' />
										</Button>
									</div>

									{/* Mobile Search */}
									<div className='border-b p-4'>
										<form
											className='relative'
											onSubmit={handleSearch}
										>
											<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
											<Input
												className='pl-9'
												onChange={e => setSearchQuery(e.target.value)}
												placeholder='Search...'
												value={searchQuery}
											/>
										</form>
									</div>

									{/* Mobile Navigation */}
									<div className='flex-1 overflow-y-auto py-2'>
										{navItems.map(item => (
											<Link
												activeProps={{
													className: "bg-teal-50 text-teal-700 dark:bg-teal-950/20"
												}}
												className='flex items-center justify-between px-4 py-3 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)'
												key={item.path}
												onClick={() => setMobileMenuOpen(false)}
												to={item.path}
											>
												<div className='flex items-center gap-3'>
													<item.icon className='h-5 w-5' />
													<span>{item.title}</span>
												</div>
												{item.badge && (
													<Badge
														className='text-xs'
														variant='secondary'
													>
														{item.badge}
													</Badge>
												)}
											</Link>
										))}

										<div className='mt-4 px-4'>
											<div className='border-t pt-4'>
												<p className='mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wider'>
													Quick Actions
												</p>
												{quickActions.map(action => (
													<Link
														className='flex items-center gap-3 py-2 text-(--sea-ink-soft) text-sm transition hover:text-(--sea-ink)'
														key={action.path}
														onClick={() => setMobileMenuOpen(false)}
														to={action.path}
													>
														<action.icon className='h-4 w-4' />
														<span>{action.label}</span>
													</Link>
												))}
											</div>
										</div>
									</div>

									{/* Mobile Footer */}
									<div className='border-t p-4'>
										<div className='mb-3 flex justify-center gap-4'>
											<a
												className='rounded-xl p-2 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)'
												href='https://x.com'
												rel='noreferrer'
												target='_blank'
											>
												<svg
													className='h-5 w-5'
													fill='currentColor'
													viewBox='0 0 24 24'
												>
													<title>X (formerly Twitter)</title>
													<path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
												</svg>
											</a>
											<a
												className='rounded-xl p-2 text-(--sea-ink-soft) transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
												href='https://github.com'
												rel='noreferrer'
												target='_blank'
											>
												<svg
													className='h-5 w-5'
													fill='currentColor'
													viewBox='0 0 24 24'
												>
													<title>GitHub</title>
													<path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.698.83.578C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z' />
												</svg>
											</a>
											<a
												className='rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
												href='/help'
											>
												<HelpCircle className='h-5 w-5' />
											</a>
										</div>
										<p className='text-center text-[var(--sea-ink-soft)] text-xs'>
											© {new Date().getFullYear()} Smart Clinic
										</p>
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</nav>

				{/* Search Modal */}
				{searchOpen && (
					<div
						className='fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20'
						onClick={() => setSearchOpen(false)}
					>
						<div
							className='w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-gray-900'
							onClick={e => e.stopPropagation()}
						>
							<form
								className='border-b p-4'
								onSubmit={handleSearch}
							>
								<div className='relative'>
									<Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
									<Input
										autoFocus
										className='py-6 pl-10 text-lg'
										onChange={e => setSearchQuery(e.target.value)}
										placeholder='Search patients, appointments, or medical records...'
										ref={searchInputRef}
										value={searchQuery}
									/>
								</div>
							</form>
							<div className='max-h-96 overflow-y-auto p-2'>
								<p className='p-2 text-gray-500 text-sm'>Recent searches will appear here...</p>
							</div>
						</div>
					</div>
				)}
			</header>
		</TooltipProvider>
	);
}

// Notification Item Component
function NotificationItem({
	title,
	description,
	time,
	type
}: {
	title: string;
	description: string;
	time: string;
	type: "appointment" | "lab" | "vaccine" | "general";
}) {
	const getIcon = () => {
		switch (type) {
			case "appointment":
				return <Calendar className='h-4 w-4 text-blue-500' />;
			case "lab":
				return <Activity className='h-4 w-4 text-purple-500' />;
			case "vaccine":
				return <Syringe className='h-4 w-4 text-green-500' />;
			default:
				return <Bell className='h-4 w-4 text-gray-500' />;
		}
	};

	return (
		<div className='flex cursor-pointer gap-3 p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800'>
			<div className='flex-shrink-0'>{getIcon()}</div>
			<div className='min-w-0 flex-1'>
				<p className='font-medium text-sm'>{title}</p>
				<p className='truncate text-gray-500 text-xs'>{description}</p>
				<p className='mt-1 text-gray-400 text-xs'>{time}</p>
			</div>
		</div>
	);
}
