import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PatientForm } from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth-functions";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/dashboard/patients/$patientId/edit")({
	component: RouteComponent,
	beforeLoad: async ({ location }) => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } });
		}
		return { session };
	},
	loader: async ({ context, params }) => {
		const { patientId } = params;

		// Prefetch patient data
		await context.queryClient.prefetchQuery(orpc.patients.get.queryOptions({ input: { id: patientId } }));

		const session = context.session;

		if (!session?.user?.primaryClinic?.id) {
			throw redirect({ to: "/dashboard" });
		}

		return {
			patientId,
			userId: session?.user?.id,
			clinicId: session?.user?.primaryClinic?.id
		};
	}
});

function RouteComponent() {
	const navigate = useNavigate();
	const { patientId, userId, clinicId } = Route.useLoaderData();

	const { data: patient, isLoading } = useQuery(orpc.patients.get.queryOptions({ input: { id: patientId } }));

	const handleSuccess = () => {
		navigate({ to: "/dashboard/patients" });
	};

	const handleCancel = () => {
		navigate({ to: "/dashboard/patients" });
	};

	if (isLoading) {
		return (
			<div className='flex min-h-[400px] items-center justify-center'>
				<div className='text-center'>
					<div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
					<p className='text-muted-foreground'>Loading patient data...</p>
				</div>
			</div>
		);
	}

	if (!patient) {
		return (
			<div className='container mx-auto max-w-5xl p-6'>
				<div className='rounded-lg border border-red-200 bg-red-50 p-4 text-center'>
					<p className='text-red-600'>Patient not found</p>
					<Button
						className='mt-4'
						onClick={() => navigate({ to: "/dashboard/patients" })}
						variant='outline'
					>
						Back to Patients
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto max-w-5xl p-6'>
			{/* Header with back button */}
			<div className='mb-6 flex items-center gap-4'>
				<Button
					className='gap-2'
					onClick={() => navigate({ to: "/dashboard/patients" })}
					size='sm'
					variant='ghost'
				>
					<ArrowLeft className='h-4 w-4' />
					Back to Patients
				</Button>
			</div>

			{/* Edit Patient Form */}
			<PatientForm
				clinicId={clinicId}
				initialData={{
					id: patient.id,
					userId: patient.userId,
					firstName: patient.firstName,
					lastName: patient.lastName,
					email: patient.email,
					phone: patient.phone,
					dateOfBirth: new Date(patient.dateOfBirth),
					gender: patient.gender as "MALE" | "FEMALE" | "OTHER",
					maritalStatus: patient.maritalStatus as
						| "SINGLE"
						| "MARRIED"
						| "DIVORCED"
						| "WIDOWED"
						| null
						| undefined,
					address: patient.address,
					emergencyContactName: patient.emergencyContactName,
					emergencyContactNumber: patient.emergencyContactNumber,
					relation: patient.relation,
					bloodGroup: patient.bloodGroup as
						| "A_POSITIVE"
						| "A_NEGATIVE"
						| "B_POSITIVE"
						| "B_NEGATIVE"
						| "O_POSITIVE"
						| "O_NEGATIVE"
						| "AB_POSITIVE"
						| "AB_NEGATIVE"
						| null
						| undefined,
					allergies: patient.allergies,
					medicalConditions: patient.medicalConditions,
					medicalHistory: patient.medicalHistory,
					nutritionalStatus: patient.nutritionalStatus,
					status: patient.status as "ACTIVE" | "INACTIVE",
					colorCode: patient.colorCode,
					image: patient.image,
					createdAt: patient.createdAt
				}}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
				userId={userId}
			/>
		</div>
	);
}
