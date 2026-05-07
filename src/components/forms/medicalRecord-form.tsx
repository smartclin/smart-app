// src/components/forms/medical-record-form.tsx

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { useAppForm } from "#/components/ui/tanstack-form";
import { Textarea } from "#/components/ui/textarea";
import { generateId } from "#/lib/id";
import { orpc } from "#/orpc/client";
import { MedicalRecordsCreateSchema } from "#/orpc/schema";

type MedicalRecordFormValues = z.infer<typeof MedicalRecordsCreateSchema>;

interface MedicalRecordFormProps {
	initialData?: Partial<MedicalRecordFormValues>;
	patientId?: string;
	appointmentId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function MedicalRecordForm({
	initialData,
	patientId,
	appointmentId,
	onSuccess,
	onCancel
}: MedicalRecordFormProps) {
	const queryClient = useQueryClient();

	// Fetch patients for dropdown
	const { data: patientsData, isLoading: patientsLoading } = useQuery(
		orpc.patients.list.queryOptions({ input: { search: "", page: 1, pageSize: 100 } })
	);

	// Create medical record mutation
	const { mutate: createRecord, isPending } = useMutation(
		orpc.medicalRecords.create.mutationOptions({
			onSuccess: () => {
				toast.success("Medical record created successfully");
				queryClient.invalidateQueries({ queryKey: orpc.medicalRecords.key() });
				onSuccess?.();
			},
			onError: (error: Error) => {
				console.error("Error creating medical record:", error);
				toast.error(error.message || "Failed to create medical record");
			}
		})
	);

	const form = useAppForm({
		defaultValues: {
			id: generateId(),
			clinicId: initialData?.clinicId ?? "",
			patientId: patientId ?? initialData?.patientId ?? "",
			appointmentId: appointmentId ?? initialData?.appointmentId ?? "",
			doctorId: initialData?.doctorId ?? null,
			diagnosis: initialData?.diagnosis ?? null,
			notes: initialData?.notes ?? null,
			symptoms: initialData?.symptoms ?? null,
			treatmentPlan: initialData?.treatmentPlan ?? "",
			labRequest: initialData?.labRequest ?? null,
			createdAt: initialData?.createdAt ?? new Date(),
			updatedAt: initialData?.updatedAt ?? new Date(),
			followUpDate: initialData?.followUpDate ?? null,
			status: initialData?.status ?? "ACTIVE",
			deletedAt: null,
			isDeleted: false
		} as MedicalRecordFormValues,
		validators: {
			onSubmit: MedicalRecordsCreateSchema
		},
		onSubmit: async ({ value }) => {
			createRecord({ record: value });
		}
	});

	const patients = patientsData?.patients ?? [];

	return (
		<Card className='mx-auto w-full max-w-3xl'>
			<CardHeader>
				<CardTitle className='font-bold text-2xl'>Create Medical Record</CardTitle>
				<p className='text-muted-foreground'>Record clinical findings, diagnosis, and treatment plans.</p>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className='space-y-6'>
						{/* Patient & Appointment */}
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							{/* Patient Selection */}
							<form.AppField name='patientId'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>
											Patient <span className='text-destructive'>*</span>
										</Label>
										<Select
											disabled={!!patientId || patientsLoading}
											onValueChange={field.handleChange}
											value={field.state.value ?? ""}
										>
											<SelectTrigger id={field.name}>
												<SelectValue placeholder='Select patient' />
											</SelectTrigger>
											<SelectContent>
												{patients.map(patient => (
													<SelectItem
														key={patient.id}
														value={patient.id}
													>
														{patient.firstName} {patient.lastName} ({patient.email})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{field.state.meta.errors.length > 0 && (
											<p className='text-destructive text-sm'>
												{field.state.meta.errors[0]?.message}
											</p>
										)}
									</div>
								)}
							</form.AppField>

							{/* Appointment ID (optional) */}
							<form.AppField name='appointmentId'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Appointment (Optional)</Label>
										<Input
											disabled={!!appointmentId}
											id={field.name}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Appointment ID'
											value={field.state.value ?? ""}
										/>
									</div>
								)}
							</form.AppField>
						</div>

						{/* Diagnosis */}
						<form.AppField name='diagnosis'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>
										Diagnosis <span className='text-destructive'>*</span>
									</Label>
									<Textarea
										id={field.name}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='Enter primary diagnosis...'
										rows={3}
										value={field.state.value ?? ""}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-destructive text-sm'>
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.AppField>

						{/* Treatment Plan */}
						<form.AppField name='treatmentPlan'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>
										Treatment Plan <span className='text-destructive'>*</span>
									</Label>
									<Textarea
										id={field.name}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='Describe the treatment provided...'
										rows={3}
										value={field.state.value ?? ""}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-destructive text-sm'>
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.AppField>

						{/* Symptoms */}
						<form.AppField name='symptoms'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Symptoms</Label>
									<Textarea
										id={field.name}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='Describe patient symptoms...'
										rows={2}
										value={field.state.value ?? ""}
									/>
								</div>
							)}
						</form.AppField>

						{/* Additional Notes */}
						<form.AppField name='notes'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Additional Notes</Label>
									<Textarea
										id={field.name}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='Any extra observations or follow-up instructions...'
										rows={2}
										value={field.state.value ?? ""}
									/>
								</div>
							)}
						</form.AppField>

						{/* Follow-up Date */}
						<form.AppField name='followUpDate'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Follow-up Date (Optional)</Label>
									<Input
										id={field.name}
										onBlur={field.handleBlur}
										onChange={e =>
											field.handleChange(e.target.value ? new Date(e.target.value) : undefined)
										}
										type='date'
										value={
											field.state.value ? format(new Date(field.state.value), "yyyy-MM-dd") : ""
										}
									/>
								</div>
							)}
						</form.AppField>

						{/* Status */}
						<form.AppField name='status'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Status</Label>
									<Select
										onValueChange={field.handleChange}
										value={field.state.value ?? "ACTIVE"}
									>
										<SelectTrigger id={field.name}>
											<SelectValue placeholder='Select status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='ACTIVE'>Active</SelectItem>
											<SelectItem value='COMPLETED'>Completed</SelectItem>
											<SelectItem value='FOLLOW_UP'>Follow-up Required</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.AppField>

						{/* Actions */}
						<div className='flex justify-end gap-4 pt-4'>
							{onCancel && (
								<Button
									disabled={isPending}
									onClick={onCancel}
									type='button'
									variant='outline'
								>
									Cancel
								</Button>
							)}
							<form.SubmitButton disabled={isPending}>
								{isPending ? "Saving..." : "Save Record"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
