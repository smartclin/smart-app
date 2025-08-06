'use client'

import type { AppointmentStatus } from '@prisma/client'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'

import { formatNumber } from '@/utils'

import { Button } from '../ui/button'

type StatSummaryData = {
	PENDING?: number
	SCHEDULED?: number
	COMPLETED?: number
	CANCELLED?: number
}

// Define a type for the items in the dataInfo array
type ChartDataItem = {
	name: string
	count: number
	fill: string
}

export const emptyAppointmentCounts: Record<AppointmentStatus, number> = {
	PENDING: 0,
	SCHEDULED: 0,
	COMPLETED: 0,
	CANCELLED: 0,
	// add any other statuses you have
}

export const StatSummary = ({ data, total }: { data: StatSummaryData; total: number }) => {
	// Ensure data properties are always numbers, defaulting to 0 if undefined
	const pendingAppointments = data?.PENDING ?? 0
	const scheduledAppointments = data?.SCHEDULED ?? 0
	const completedConsultations = data?.COMPLETED ?? 0

	// Explicitly type dataInfo as an array of ChartDataItem
	const dataInfo: ChartDataItem[] = [
		{ name: 'Total', count: total || 0, fill: 'white' },
		{
			name: 'Appointments',
			count: pendingAppointments + scheduledAppointments,
			fill: '#000000',
		},
		{ name: 'Consultation', count: completedConsultations, fill: '#2563eb' },
	]

	// Extract the specific data items to ensure TypeScript knows their type
	const appointmentData = dataInfo[1]
	const consultationData = dataInfo[2]

	const appointment = appointmentData?.count ?? 0 // This will now always be a number
	const consultation = consultationData?.count ?? 0 // This will now always be a number

	const totalSum = appointment + consultation

	return (
		<div className="h-full w-full rounded-xl bg-white p-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-lg">Summary</h1>

				<Button
					asChild
					className="font-normal text-xs"
					size="sm"
					variant="outline"
				>
					<Link href="/record/appointments">See details</Link>
				</Button>
			</div>

			<div className="relative h-[75%] w-full">
				<ResponsiveContainer>
					<RadialBarChart
						barSize={32}
						cx="50%"
						cy="50%"
						data={dataInfo}
						innerRadius="40%"
						outerRadius="100%"
					>
						<RadialBar
							background
							dataKey={'count'}
						/>
					</RadialBarChart>
				</ResponsiveContainer>

				<Users
					className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-gray-400"
					size={30}
				/>
			</div>

			<div className="flex justify-center gap-16">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<div className="h-5 w-5 rounded-xl bg-[#000000]" />
						<h1 className="font-bold">{formatNumber(appointment)}</h1>
					</div>
					<h2 className="text-gray-400 text-xs">
						{/* Use the explicitly typed appointmentData */}
						{appointmentData?.name}({totalSum > 0 ? ((appointment / totalSum) * 100).toFixed(0) : 0}
						% )
					</h2>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<div className="h-5 w-5 rounded-xl bg-[#2563eb]" />
						<h1 className="font-bold">{formatNumber(consultation)}</h1>
					</div>

					<h2 className="text-gray-400 text-xs">
						{/* Use the explicitly typed consultationData */}
						{consultationData?.name ?? ''}(
						{totalSum > 0 ? ((consultation / totalSum) * 100).toFixed(0) : 0}% )
					</h2>
				</div>
			</div>
		</div>
	)
}
