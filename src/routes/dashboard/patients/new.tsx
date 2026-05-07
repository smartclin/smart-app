// routes/dashboard/patients/new.tsx
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

 import { Button } from "#/components/ui/button";
import { orpc } from "#/orpc/client";
import { getSession } from "@/lib/auth-functions";
import { PatientForm } from "@/components/forms/PatientForm";

export const Route = createFileRoute("/dashboard/patients/new")({
	component: NewPatientPage,
	beforeLoad: async ({ location }) => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } });
		}
		return { session: session as NonNullable<typeof session> };
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			orpc.patients.list.queryOptions({ input: { page: 1, limit: 100 } })
		);
	},
});

function NewPatientPage() {
	const navigate = useNavigate();
	const { session } = Route.useBeforeLoad();
	const userId = session?.user?.id ?? "";
	const clinicId = session?.user?.primaryClinic?.id ?? "";

	const handleSuccess = () => {
		// Navigate back to patients list after successful creation
		navigate({ to: "/dashboard/patients" });
	};

	const handleCancel = () => {
		navigate({ to: "/dashboard/patients" });
	};

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

			{/* Patient Form */}
			<PatientForm
				clinicId={clinicId}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
				userId={userId}
			/>
		</div>
	);
}
