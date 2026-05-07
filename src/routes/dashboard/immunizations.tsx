import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { orpc } from "#/orpc/client";
import { getSession } from "@/lib/auth-functions";

// Type definitions
type Immunization = {
	id: string;
	vaccine: string;
	dose?: string;
	date: Date;
	status?: string;
};

type PendingVaccine = {
	vaccineName: string;
	recommendedAge: string;
	dosesRequired: number;
	isMandatory?: boolean;
	description?: string;
};

type ImmunizationSchedule = {
	administered: Immunization[];
	pending: PendingVaccine[];
	ageInDays: number;
};

export const Route = createFileRoute("/dashboard/immunizations")({
	component: ImmunizationPage,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	loader: async ({ context, params }) => {
		const { patientId } = params as { patientId: string };
		await context.queryClient.prefetchQuery(
			orpc.immunizations.getSchedule.queryOptions({
				input: { patientId }
			})
		);
	}
});

function ImmunizationPage() {
	const { patientId } = Route.useParams() as { patientId: string };

	const { data: schedule, refetch } = useQuery(
		orpc.immunizations.getSchedule.queryOptions({
			input: { patientId }
		})
	);

	const recordImmunization = useMutation({
		mutationFn: (input: {
			patientId: string;
			vaccine: string;
			date: Date;
			dose: string;
			lotNumber?: string;
			notes?: string;
		}) => orpc.immunizations.record.call(input),
		onSuccess: () => {
			refetch();
		},
		onError: (error: Error) => {
			console.error("Failed to record immunization:", error);
		}
	});

	const handleRecordImmunization = (vaccineName: string) => {
		recordImmunization.mutate({
			patientId,
			vaccine: vaccineName,
			date: new Date(),
			dose: "1"
		});
	};

	return (
		<div className='p-6'>
			<div className='mb-6'>
				<h1 className='font-bold text-2xl'>Immunization Schedule</h1>
				<p className='mt-1 text-gray-500'>Track and manage patient vaccinations</p>
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				{/* Completed Vaccines */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<span>Completed Vaccinations</span>
							<Badge
								className='ml-2'
								variant='secondary'
							>
								{(schedule as ImmunizationSchedule)?.administered?.length || 0}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{(schedule as ImmunizationSchedule)?.administered?.map((vaccine: Immunization) => (
								<div
									className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50'
									key={vaccine.id}
								>
									<div>
										<p className='font-medium'>{vaccine.vaccine}</p>
										<p className='text-gray-500 text-sm'>
											Dose: {vaccine.dose || "1"} • {new Date(vaccine.date).toLocaleDateString()}
										</p>
									</div>
									<Badge
										className='bg-green-100 text-green-800'
										variant='default'
									>
										Completed
									</Badge>
								</div>
							))}
							{(!(schedule as ImmunizationSchedule)?.administered ||
								(schedule as ImmunizationSchedule)?.administered?.length === 0) && (
								<div className='py-8 text-center text-gray-500'>
									<p>No vaccinations recorded yet</p>
									<p className='mt-1 text-sm'>Record your first immunization above</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Pending Vaccines */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<span>Due / Pending Vaccines</span>
							<Badge
								className='ml-2'
								variant='secondary'
							>
								{(schedule as ImmunizationSchedule)?.pending?.length || 0}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{(schedule as ImmunizationSchedule)?.pending?.map(
								(vaccine: PendingVaccine, index: number) => (
									<div
										className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50'
										key={index}
									>
										<div className='flex-1'>
											<div className='flex items-center gap-2'>
												<p className='font-medium'>{vaccine.vaccineName}</p>
												{vaccine.isMandatory && (
													<Badge
														className='text-xs'
														variant='outline'
													>
														Mandatory
													</Badge>
												)}
											</div>
											<p className='text-gray-500 text-sm'>
												Recommended: {vaccine.recommendedAge} • {vaccine.dosesRequired} dose
												{vaccine.dosesRequired > 1 ? "s" : ""} required
											</p>
											{vaccine.description && (
												<p className='mt-1 text-gray-400 text-xs'>{vaccine.description}</p>
											)}
										</div>
										<Button
											className='ml-4'
											onClick={() => handleRecordImmunization(vaccine.vaccineName)}
											size='sm'
											variant='outline'
										>
											Record Now
										</Button>
									</div>
								)
							)}
							{(!(schedule as ImmunizationSchedule)?.pending ||
								(schedule as ImmunizationSchedule)?.pending?.length === 0) && (
								<div className='py-8 text-center'>
									<div className='mb-2 text-4xl'>✓</div>
									<p className='font-medium text-green-600'>All vaccinations are up to date!</p>
									<p className='mt-1 text-gray-500 text-sm'>No pending immunizations at this time</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Age Information */}
			{(schedule as ImmunizationSchedule)?.ageInDays !== undefined && (
				<Card className='mt-6 border-blue-200 bg-blue-50'>
					<CardContent className='pt-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='font-medium text-blue-800 text-sm'>Patient Age</p>
								<p className='font-bold text-2xl text-blue-900'>
									{Math.floor((schedule as ImmunizationSchedule).ageInDays / 30)} months,{" "}
									{(schedule as ImmunizationSchedule).ageInDays} days
								</p>
							</div>
							<Badge
								className='border-blue-200 bg-blue-100 text-blue-800'
								variant='outline'
							>
								Age-based schedule
							</Badge>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Loading State */}
			{!schedule && (
				<div className='flex items-center justify-center py-12'>
					<div className='text-center'>
						<div className='mb-2 text-gray-400'>Loading immunization schedule...</div>
					</div>
				</div>
			)}
		</div>
	);
}
