// routes/dashboard/patients.tsx
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { orpc } from "#/orpc/client";
import { PatientsTable } from "@/components/table/patient-table";
import { getSession } from "@/lib/auth-functions";
import type { Patient } from "@/orpc/schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/patients")({
	component: PatientsPage,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(orpc.patients.list.queryOptions({ input: { page: 1, limit: 100 } }));
	}
});

function PatientsPage() {
	const navigate = useNavigate();

	const handleEdit = (patient: Patient) => {
		window.location.href = `/dashboard/patients/${patient.id}/edit`;
	};

	return (
		<div className='w-full space-y-4 p-6'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h2 className='font-bold text-2xl tracking-tight'>Pediatric Patients</h2>
					<p className='text-muted-foreground text-sm'>
						Manage and view all registered children in your clinic
					</p>
				</div>
				<Button onClick={() => navigate({ to: "/dashboard/patients/new" })}>
					<Plus className='mr-2 h-4 w-4' />
					Add New Patient
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Patient Directory</CardTitle>
					<CardDescription>
						View and manage all pediatric patients, their medical history, and upcoming appointments. Use
						the search box to filter by name, email, or phone.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PatientsTable
						clinicId={""}
						onEdit={handleEdit}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
