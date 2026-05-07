// src/routes/dashboard/appointments/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { orpc } from "#/orpc/client";

import { AppointmentsTable } from "./appointment-table";

export const Route = createFileRoute("/dashboard/appointments")({
	component: AppointmentsPage,
	loader: async ({ context }) => {
		// Prefetch today's appointments
		const today = new Date();
		const startOfDay = new Date(today.setHours(0, 0, 0, 0));
		const endOfDay = new Date(today.setHours(23, 59, 59, 999));

		await context.queryClient.prefetchQuery(
			orpc.appointments.list.queryOptions({
				input: {
					page: 1,
					limit: 50,
					startDate: startOfDay,
					endDate: endOfDay,
					fromDate: startOfDay,
					toDate: endOfDay
				}
			})
		);
	}
});

function AppointmentsPage() {
	const [activeTab, setActiveTab] = useState("upcoming");

	// Get clinicId from context or user session
	const clinicId = "your-clinic-id"; // Replace with actual clinic ID from context

	return (
		<div className='container mx-auto p-6'>
			<div className='mb-6'>
				<h1 className='font-bold text-3xl'>Appointments</h1>
				<p className='mt-1 text-gray-500'>Manage and schedule patient appointments</p>
			</div>

			<Tabs
				className='space-y-4'
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList>
					<TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
					<TabsTrigger value='today'>Today</TabsTrigger>
					<TabsTrigger value='all'>All Appointments</TabsTrigger>
					<TabsTrigger value='completed'>Completed</TabsTrigger>
				</TabsList>

				<TabsContent
					className='space-y-4'
					value='upcoming'
				>
					<Card>
						<CardHeader>
							<CardTitle>Upcoming Appointments</CardTitle>
						</CardHeader>
						<CardContent>
							<AppointmentsTable
								clinicId={clinicId}
								filters={{ status: "SCHEDULED" }}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='space-y-4'
					value='today'
				>
					<Card>
						<CardHeader>
							<CardTitle>Today's Appointments</CardTitle>
						</CardHeader>
						<CardContent>
							<AppointmentsTable
								clinicId={clinicId}
								filters={{
									startDate: new Date(),
									endDate: new Date()
								}}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='space-y-4'
					value='all'
				>
					<Card>
						<CardHeader>
							<CardTitle>All Appointments</CardTitle>
						</CardHeader>
						<CardContent>
							<AppointmentsTable clinicId={clinicId} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='space-y-4'
					value='completed'
				>
					<Card>
						<CardHeader>
							<CardTitle>Completed Appointments</CardTitle>
						</CardHeader>
						<CardContent>
							<AppointmentsTable
								clinicId={clinicId}
								filters={{ status: "COMPLETED" }}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
