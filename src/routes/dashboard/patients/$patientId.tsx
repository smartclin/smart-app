// routes/dashboard/patient/$patientId.tsx

import * as Sentry from "@sentry/tanstackstart-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Heart, Mail, Phone, Syringe, User } from "lucide-react";
import { useEffect } from "react";

import { orpc } from "#/orpc/client";
import type { DbVaccineSchedule } from "@/db/schema";
import { getSession } from "@/lib/auth-functions";
import { calculateAge } from "@/utils/growth";

export const Route = createFileRoute("/dashboard/patients/$patientId")({
	component: PatientDashboard,
	errorComponent: PatientErrorDisplay,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	loader: async ({ params, context }) => {
		const { patientId } = params;

		// Prefetch patient data
		await context.queryClient.prefetchQuery(orpc.patients.get.queryOptions({ input: { id: patientId } }));

		// Prefetch patient medical history
		await context.queryClient.prefetchQuery(
			orpc.medicalRecords.getHistory.queryOptions({
				input: {
					patientId,
					limit: 10
				}
			})
		);

		// Prefetch patient appointments
		await context.queryClient.prefetchQuery(
			orpc.appointments.list.queryOptions({
				input: {
					patientId,
					limit: 10,
					fromDate: new Date("2000-01-01"),
					toDate: new Date("2100-01-01")
				}
			})
		);
	}
});

function PatientDashboard() {
	const { patientId } = Route.useParams();
	const navigate = useNavigate();

	const {
		data: patient,
		isLoading: patientLoading,
		error: patientError
	} = useQuery(orpc.patients.get.queryOptions({ input: { id: patientId } }));

	const { data: medicalHistory } = useQuery(
		orpc.medicalRecords.getHistory.queryOptions({
			input: { patientId, limit: 10 }
		})
	);

	const { data: appointments } = useQuery(
		orpc.appointments.list.queryOptions({
			input: {
				patientId,
				limit: 10,
				fromDate: new Date("2000-01-01"),
				toDate: new Date("2100-01-01")
			}
		})
	);

	const { data: growthData } = useQuery(
		orpc.growth.getChart.queryOptions({
			input: {
				patientId,
				measurementType: "WEIGHT"
			}
		})
	);

	const { data: vaccinationSchedule } = useQuery(
		orpc.immunizations.getSchedule.queryOptions({ input: { patientId } })
	);

	// Track page view in Sentry
	useEffect(() => {
		Sentry.addBreadcrumb({
			category: "navigation",
			message: `Viewed patient dashboard for ${patientId}`,
			level: "info",
			data: { patientId }
		});
	}, [patientId]);

	if (patientLoading) {
		return (
			<div className='flex min-h-[400px] items-center justify-center'>
				<div className='text-center'>
					<div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
					<p className='text-muted-foreground'>Loading patient data...</p>
				</div>
			</div>
		);
	}

	if (patientError || !patient) {
		return (
			<div className='p-6'>
				<div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
					<h2 className='font-semibold text-red-800 dark:text-red-200'>Error Loading Patient</h2>
					<p className='mt-2 text-red-600 dark:text-red-400'>
						{patientError instanceof Error ? patientError.message : "Patient not found"}
					</p>
					<button
						className='mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
						onClick={() => window.location.reload()}
						type='button'
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}


	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-start justify-between'>
				<div>
					<h1 className='font-bold text-2xl tracking-tight'>
						{patient.firstName} {patient.lastName}
					</h1>
					<p className='text-muted-foreground'>Patient ID: {patient.id}</p>
				</div>
				<div className='flex gap-2'>
					<button
						className='rounded-md border px-4 py-2 font-medium text-sm hover:bg-accent'
						onClick={() =>
							navigate({
								to: "/dashboard/patients/$patientId/edit",
								params: { patientId: patient.id }
							})
						}
						type='button'
					>
						Edit Profile
					</button>
					<button
						className='rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90'
						onClick={() =>
							navigate({
								to: "/dashboard/appointments",
								search: { patientId: patient.id, action: "new" }
							})
						}
						type='button'
					>
						Schedule Appointment
					</button>
				</div>{" "}
			</div>

			{/* Patient Info Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center gap-2 text-muted-foreground'>
						<User className='h-4 w-4' />
						<span className='text-sm'>Age</span>
					</div>
					<p className='mt-2 font-semibold text-2xl'>{calculateAge(new Date(patient.dateOfBirth))}</p>
					<p className='text-muted-foreground text-xs'>
						DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
					</p>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center gap-2 text-muted-foreground'>
						<Heart className='h-4 w-4' />
						<span className='text-sm'>Blood Type</span>
					</div>
					<p className='mt-2 font-semibold text-2xl'>{patient.bloodGroup || "N/A"}</p>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center gap-2 text-muted-foreground'>
						<Phone className='h-4 w-4' />
						<span className='text-sm'>Contact</span>
					</div>
					<p className='mt-2 font-medium text-sm'>{patient.phone || "No phone"}</p>
					<p className='text-muted-foreground text-xs'>{patient.email || "No email"}</p>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center gap-2 text-muted-foreground'>
						<Mail className='h-4 w-4' />
						<span className='text-sm'>Gender</span>
					</div>
					<p className='mt-2 font-semibold text-2xl'>{patient.gender || "N/A"}</p>
				</div>
			</div>

			{/* Medical Information */}
			<div className='grid gap-6 md:grid-cols-2'>
				{/* Allergies & Conditions */}
				<div className='rounded-lg border bg-card'>
					<div className='border-b p-4'>
						<h3 className='font-semibold'>Medical Information</h3>
					</div>
					<div className='space-y-4 p-4'>
						<div>
							<p className='font-medium text-muted-foreground text-sm'>Allergies</p>
							<p className='mt-1'>{patient.allergies || "None reported"}</p>
						</div>
						<div>
							<p className='font-medium text-muted-foreground text-sm'>Medical Conditions</p>
							<p className='mt-1'>{patient.medicalConditions || "None reported"}</p>
						</div>
						<div>
							<p className='font-medium text-muted-foreground text-sm'>Address</p>
							<p className='mt-1'>{patient.address || "No address on file"}</p>
						</div>
					</div>
				</div>

				{/* Recent Appointments */}
				<div className='rounded-lg border bg-card'>
					<div className='border-b p-4'>
						<h3 className='font-semibold'>Recent Appointments</h3>
					</div>
					<div className='p-4'>
						{appointments?.appointments.length === 0 ? (
							<p className='text-muted-foreground text-sm'>No recent appointments</p>
						) : (
							<div className='space-y-3'>
								{appointments?.appointments.slice(0, 5).map(apt => (
									<div
										className='flex items-center justify-between border-b pb-2 last:border-0'
										key={apt.id}
									>
										<div>
											<p className='font-medium text-sm'>
												{new Date(apt.appointmentDate).toLocaleDateString()}
											</p>
											<p className='text-muted-foreground text-xs'>{apt.type}</p>
										</div>
										<span
											className={`rounded-full px-2 py-1 text-xs ${
												apt.status === "SCHEDULED"
													? "bg-green-100 text-green-700"
													: apt.status === "COMPLETED"
														? "bg-blue-100 text-blue-700"
														: "bg-gray-100 text-gray-700"
											}`}
										>
											{apt.status}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Medical History */}
			<div className='rounded-lg border bg-card'>
				<div className='border-b p-4'>
					<h3 className='font-semibold'>Medical History</h3>
				</div>
				<div className='p-4'>
					{medicalHistory?.records.length === 0 ? (
						<p className='text-muted-foreground text-sm'>No medical records found</p>
					) : (
						<div className='space-y-4'>
							{medicalHistory?.records.map(record => (
								<div
									className='rounded-lg border p-4'
									key={record.id}
								>
									<div className='flex items-start justify-between'>
										<div>
											<p className='font-medium'>{record.diagnosis || "No diagnosis recorded"}</p>
											<p className='text-muted-foreground text-sm'>
												{new Date(record.createdAt).toLocaleDateString()}
											</p>
										</div>
										{record.doctor && (
											<span className='text-muted-foreground text-xs'>
												Dr. {record.doctor.name}
											</span>
										)}
									</div>
									{record.symptoms && (
										<p className='mt-2 text-sm'>
											<span className='font-medium'>Symptoms:</span> {record.symptoms}
										</p>
									)}
									{record.treatmentPlan && (
										<p className='mt-1 text-sm'>
											<span className='font-medium'>Treatment:</span> {record.treatmentPlan}
										</p>
									)}
									<div className='mt-2 flex gap-4 text-muted-foreground text-xs'>
										<span>Diagnoses: {record.diagnosisCount || 0}</span>
										<span>Vitals: {record.vitalSignsCount || 0}</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Growth Chart */}
			{growthData && growthData.length > 0 && (
				<div className='rounded-lg border bg-card'>
					<div className='border-b p-4'>
						<h3 className='font-semibold'>Growth Chart</h3>
					</div>
					<div className='p-4'>
						<div className='space-y-3'>
							{growthData.slice(0, 5).map(record => (
								<div
									className='flex items-center justify-between border-b pb-2 last:border-0'
									key={record.id}
								>
									<div>
										<p className='font-medium text-sm'>
											{new Date(record.date).toLocaleDateString()}
										</p>
										<div className='flex gap-3 text-muted-foreground text-xs'>
											{record.weight && <span>Weight: {record.weight} kg</span>}
											{record.height && <span>Height: {record.height} cm</span>}
											{record.headCircumference && (
												<span>Head: {record.headCircumference} cm</span>
											)}
										</div>
									</div>
									{record.zScore && (
										<span
											className={`text-xs ${
												record.zScore >= -2 && record.zScore <= 2
													? "text-green-600"
													: "text-yellow-600"
											}`}
										>
											Z-Score: {record.zScore}
										</span>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Vaccination Schedule */}
			{vaccinationSchedule && vaccinationSchedule.length > 0 && (
				<div className='rounded-lg border bg-card'>
					<div className='border-b p-4'>
						<h3 className='flex items-center gap-2 font-semibold'>
							<Syringe className='h-4 w-4' />
							Vaccination Schedule
						</h3>
					</div>
					<div className='p-4'>
						<div className='space-y-3'>
							{vaccinationSchedule.map((vaccine: DbVaccineSchedule) => (
								<div
									className='flex items-center justify-between border-b pb-2 last:border-0'
									key={vaccine.id}
								>
									<div>
										<p className='font-medium'>{vaccine.vaccineName}</p>
										<p className='text-muted-foreground text-xs'>
											Due:{" "}
											{vaccine.dueDate ? new Date(vaccine.dueDate).toLocaleDateString() : "N/A"}
										</p>
									</div>
									<span
										className={`rounded-full px-2 py-1 text-xs ${
											vaccine.status === "COMPLETED"
												? "bg-green-100 text-green-700"
												: vaccine.isOverDue
													? "bg-red-100 text-red-700"
													: "bg-yellow-100 text-yellow-700"
										}`}
									>
										{vaccine.status || (vaccine.isOverDue ? "Overdue" : "Pending")}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function PatientErrorDisplay({ error }: { error: Error }) {
	const { patientId } = Route.useParams();

	useEffect(() => {
		Sentry.captureException(error, {
			tags: {
				component: "PatientDashboard",
				route: "patient-detail"
			},
			extra: {
				patientId
			}
		});
	}, [error, patientId]);

	return (
		<div className='p-6'>
			<div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
				<h2 className='font-semibold text-red-800 dark:text-red-200'>Error Loading Patient Data</h2>
				<p className='mt-2 text-red-600 dark:text-red-400'>{error.message || "An unexpected error occurred"}</p>
				<div className='mt-4 flex gap-3'>
					<button
						className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
						onClick={() => window.location.reload()}
						type='button'
					>
						Try Again
					</button>
					<button
						className='rounded border px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950'
						onClick={() => window.history.back()}
						type='button'
					>
						Go Back
					</button>
				</div>
			</div>
		</div>
	);
}
