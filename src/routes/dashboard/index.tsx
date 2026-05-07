import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Activity, AlertCircle, Baby, Calendar, CheckCircle, Heart, Syringe, TrendingUp, Users } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { orpc } from "#/orpc/client";
import { getSession } from "@/lib/auth-functions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.prefetchQuery(orpc.dashboard.getDashboardStats.queryOptions()),
			context.queryClient.prefetchQuery(
				orpc.appointments.getByDateRange.queryOptions({
					input: { startDate: new Date(), endDate: new Date() }
				})
			)
		]);
	}
});

function RouteComponent() {
	const { data: stats } = useQuery(orpc.dashboard.getDashboardStats.queryOptions());
	const { data: todayAppointments } = useQuery(
		orpc.appointments.getByDateRange.queryOptions({
			input: { startDate: new Date(), endDate: new Date() }
		})
	);

	const pediatricStats = [
		{
			title: "Active Patients",
			value: stats?.overview.totalPatients?.toLocaleString() || "0",
			icon: Users,
			trend: "+12%",
			trendUp: true,
			color: "bg-blue-500",
			description: "Total registered patients"
		},
		{
			title: "Immunizations Due",
			value: "28",
			icon: Syringe,
			trend: "+5",
			trendUp: false,
			color: "bg-yellow-500",
			description: "Overdue or upcoming vaccines"
		},
		{
			title: "Growth Charts",
			value: "156",
			icon: Activity,
			trend: "+23",
			trendUp: true,
			color: "bg-green-500",
			description: "Measurements recorded this month"
		},
		{
			title: "Today's Checkups",
			value: todayAppointments?.length?.toString() || "0",
			icon: Calendar,
			trend: "+3",
			trendUp: true,
			color: "bg-purple-500",
			description: "Scheduled appointments"
		}
	];

	const recentPatients = [
		{
			id: 1,
			name: "Emma Thompson",
			age: "2 years",
			parent: "Sarah Thompson",
			lastVisit: "2024-01-15",
			status: "Healthy",
			avatar: "ET"
		},
		{
			id: 2,
			name: "Noah Martinez",
			age: "6 months",
			parent: "Carlos Martinez",
			lastVisit: "2024-01-14",
			status: "Follow-up",
			avatar: "NM"
		},
		{
			id: 3,
			name: "Olivia Chen",
			age: "4 years",
			parent: "Jennifer Chen",
			lastVisit: "2024-01-13",
			status: "Vaccination",
			avatar: "OC"
		},
		{
			id: 4,
			name: "Liam Williams",
			age: "8 years",
			parent: "David Williams",
			lastVisit: "2024-01-12",
			status: "Sick Visit",
			avatar: "LW"
		}
	];

	const immunizationSchedule = [
		{ vaccine: "MMR", dueDate: "2024-01-20", patients: 8, priority: "high" },
		{ vaccine: "DTaP", dueDate: "2024-01-22", patients: 12, priority: "high" },
		{ vaccine: "Hepatitis B", dueDate: "2024-01-25", patients: 5, priority: "medium" },
		{ vaccine: "Polio", dueDate: "2024-01-28", patients: 6, priority: "medium" },
		{ vaccine: "Varicella", dueDate: "2024-02-01", patients: 4, priority: "low" }
	];

	const ageGroups = [
		{ group: "0-12 months", count: 145, percentage: 25, color: "bg-blue-500" },
		{ group: "1-3 years", count: 210, percentage: 35, color: "bg-green-500" },
		{ group: "4-6 years", count: 156, percentage: 26, color: "bg-yellow-500" },
		{ group: "7-12 years", count: 84, percentage: 14, color: "bg-purple-500" }
	];

	const revenueData = [
		{ month: "Jan", revenue: 12500 },
		{ month: "Feb", revenue: 14200 },
		{ month: "Mar", revenue: 13800 },
		{ month: "Apr", revenue: 15600 },
		{ month: "May", revenue: 16800 },
		{ month: "Jun", revenue: 18200 }
	];

	return (
		<div className='min-h-screen bg-gray-50 p-6'>
			<div className='mb-8'>
				<h1 className='font-bold text-3xl text-gray-900'>Pediatric Dashboard</h1>
				<p className='mt-1 text-gray-500'>Welcome back, Dr. Sarah! Here's your clinic overview</p>
			</div>

			<div className='mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
				{pediatricStats.map((stat, index) => (
					<Card
						className='transition-shadow hover:shadow-lg'
						key={index}
					>
						<CardContent className='p-6'>
							<div className='mb-4 flex items-center justify-between'>
								<div className={`${stat.color} rounded-xl p-3 text-white`}>
									<stat.icon className='h-6 w-6' />
								</div>
								<Badge
									className='text-xs'
									variant={stat.trendUp ? "default" : "destructive"}
								>
									{stat.trend}
								</Badge>
							</div>
							<div>
								<p className='font-bold text-2xl'>{stat.value}</p>
								<p className='mt-1 text-gray-600 text-sm'>{stat.title}</p>
								<p className='mt-2 text-gray-400 text-xs'>{stat.description}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className='mb-6 grid gap-6 lg:grid-cols-3'>
				<Card className='lg:col-span-2'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<TrendingUp className='h-5 w-5 text-green-500' />
							Revenue Trend
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer
							height={300}
							width='100%'
						>
							<LineChart data={revenueData}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='month' />
								<YAxis />
								<Tooltip />
								<Line
									dataKey='revenue'
									stroke='#14b8a6'
									strokeWidth={2}
									type='monotone'
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Baby className='h-5 w-5 text-pink-500' />
							Age Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{ageGroups.map(group => (
								<div key={group.group}>
									<div className='mb-1 flex justify-between text-sm'>
										<span className='font-medium'>{group.group}</span>
										<span className='text-gray-500'>{group.count} patients</span>
									</div>
									<Progress
										className='h-2'
										value={group.percentage}
									/>
								</div>
							))}
						</div>
						<div className='mt-6 border-t pt-6'>
							<div className='flex justify-between text-sm'>
								<span className='text-gray-600'>Total Active Patients</span>
								<span className='font-bold text-lg'>595</span>
							</div>
							<div className='mt-2 flex justify-between text-sm'>
								<span className='text-gray-600'>Average Age</span>
								<span className='font-medium'>3.2 years</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className='mb-6 grid gap-6 lg:grid-cols-3'>
				<Card className='lg:col-span-2'>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle className='flex items-center gap-2'>
							<Users className='h-5 w-5 text-blue-500' />
							Recent Patients
						</CardTitle>
						<Button
							size='sm'
							variant='ghost'
						>
							View All
						</Button>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{recentPatients.map(patient => (
								<div
									className='flex items-center justify-between rounded-lg p-3 transition hover:bg-gray-50'
									key={patient.id}
								>
									<div className='flex items-center gap-3'>
										<Avatar className='h-10 w-10'>
											<AvatarFallback className='bg-teal-100 text-teal-700'>
												{patient.avatar}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className='font-medium'>{patient.name}</p>
											<p className='text-gray-500 text-sm'>
												{patient.age} • Parent: {patient.parent}
											</p>
										</div>
									</div>
									<div className='text-right'>
										<Badge
											className='mb-1'
											variant='outline'
										>
											{patient.status}
										</Badge>
										<p className='text-gray-400 text-xs'>Last: {patient.lastVisit}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Syringe className='h-5 w-5 text-green-500' />
							Upcoming Immunizations
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{immunizationSchedule.map(item => (
								<div
									className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
									key={item.vaccine}
								>
									<div className='flex items-center gap-3'>
										<div
											className={`h-2 w-2 rounded-full ${item.priority === "high" ? "bg-red-500" : item.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
										/>
										<div>
											<p className='font-medium'>{item.vaccine}</p>
											<p className='text-gray-500 text-xs'>Due: {item.dueDate}</p>
										</div>
									</div>
									<Badge variant='secondary'>{item.patients} patients</Badge>
								</div>
							))}
						</div>
						<Button
							className='mt-4 w-full'
							variant='outline'
						>
							View Complete Schedule
						</Button>
					</CardContent>
				</Card>
			</div>

			<div className='mb-6 grid gap-6 lg:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<Button
							className='w-full justify-start'
							variant='outline'
						>
							<Baby className='mr-2 h-4 w-4' />
							New Patient Registration
						</Button>
						<Button
							className='w-full justify-start'
							variant='outline'
						>
							<Syringe className='mr-2 h-4 w-4' />
							Record Immunization
						</Button>
						<Button
							className='w-full justify-start'
							variant='outline'
						>
							<Activity className='mr-2 h-4 w-4' />
							Add Growth Measurement
						</Button>
						<Button
							className='w-full justify-start'
							variant='outline'
						>
							<Calendar className='mr-2 h-4 w-4' />
							Schedule Appointment
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<AlertCircle className='h-5 w-5 text-yellow-500' />
							Growth & Development Alerts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid gap-4 md:grid-cols-2'>
							<div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
								<div className='mb-2 flex items-center gap-2'>
									<AlertCircle className='h-4 w-4 text-yellow-600' />
									<span className='font-semibold text-yellow-800'>Weight Concern</span>
								</div>
								<p className='text-sm text-yellow-700'>
									3 patients below 5th percentile for weight-for-age
								</p>
							</div>
							<div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
								<div className='mb-2 flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-blue-600' />
									<span className='font-semibold text-blue-800'>Milestones</span>
								</div>
								<p className='text-blue-700 text-sm'>12 patients due for developmental screening</p>
							</div>
							<div className='rounded-lg border border-green-200 bg-green-50 p-4'>
								<div className='mb-2 flex items-center gap-2'>
									<Heart className='h-4 w-4 text-green-600' />
									<span className='font-semibold text-green-800'>Wellness</span>
								</div>
								<p className='text-green-700 text-sm'>Monthly checkups scheduled for 8 patients</p>
							</div>
							<div className='rounded-lg border border-purple-200 bg-purple-50 p-4'>
								<div className='mb-2 flex items-center gap-2'>
									<Activity className='h-4 w-4 text-purple-600' />
									<span className='font-semibold text-purple-800'>Growth Tracking</span>
								</div>
								<p className='text-purple-700 text-sm'>
									15 patients need growth measurements this week
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
