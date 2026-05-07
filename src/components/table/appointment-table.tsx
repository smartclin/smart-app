import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon, EyeIcon, PencilIcon, PhoneIcon, PlusIcon, Trash2, VideoIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "#/components/table/data-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "#/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { getInitials } from "#/lib/utils";
import { orpc } from "#/orpc/client";

interface Appointment {
	id: string;
	patientId: string;
	doctorId: string;
	serviceId?: string | null;
	clinicId: string;
	appointmentDate: string | Date;
	time?: string | null;
	durationMinutes?: number | null;
	appointmentPrice?: number | null;
	status: "SCHEDULED" | "PENDING" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | undefined;
	type: string;
	note?: string | null;
	reason?: string | null;
	patient?: {
		id: string;
		firstName: string;
		lastName: string;
		email?: string | null;
		phone?: string | null;
		image?: string | null;
	};
	doctor?: {
		id: string;
		name: string;
		specialty: string;
		email?: string | null;
		phone?: string | null;
		img?: string | null;
		colorCode?: string | null;
	};
	service?: {
		id: string;
		serviceName: string;
		price: number;
		duration: number;
	};
}

interface AppointmentsTableProps {
	clinicId: string;
	onEdit?: (appointment: Appointment) => void;
	onView?: (appointment: Appointment) => void;
	filters?: {
		status?: string;
		doctorId?: string;
		startDate?: Date;
		endDate?: Date;
	};
}

export function AppointmentsTable({ clinicId, onEdit, onView, filters }: AppointmentsTableProps) {
	const queryClient = useQueryClient();

	// Build query input with filters
	const queryInput = {
		page: 1,
		limit: 100,
		...(filters?.status && { status: filters.status }),
		...(filters?.doctorId && { doctorId: filters.doctorId }),
		...(filters?.startDate && { startDate: filters.startDate }),
		...(filters?.endDate && { endDate: filters.endDate })
	};

	// Fetch appointments using ORPC
	const { data, isLoading } = useQuery({
		queryKey: orpc.appointments.list.key({ input: queryInput }),
		queryFn: () => orpc.appointments.list.call(queryInput)
	});

	const updateAppointmentStatus = useMutation({
		mutationFn: (input: { id: string; status: Appointment["status"] }) =>
			orpc.appointments.update.call({ id: input.id, status: input.status }),
		onSuccess: () => {
			toast.success("Appointment status updated successfully");
			queryClient.invalidateQueries({ queryKey: orpc.appointments.list.key({}) });
		},
		onError: error => {
			console.error(error);
			toast.error("Failed to update appointment status");
		}
	});

	const deleteAppointment = useMutation({
		mutationFn: (input: { id: string }) => orpc.appointments.delete?.call?.(input) || Promise.resolve(),
		onSuccess: () => {
			toast.success("Appointment deleted successfully");
			queryClient.invalidateQueries({ queryKey: orpc.appointments.list.key({}) });
		},
		onError: error => {
			console.error(error);
			toast.error("Failed to delete appointment");
		}
	});

	const getStatusBadge = (status: Appointment["status"]) => {
		const variants: Record<Appointment["status"], "default" | "secondary" | "destructive" | "outline" | "warning"> =
			{
				SCHEDULED: "default",
				PENDING: "warning",
				COMPLETED: "secondary",
				CANCELLED: "destructive",
				NO_SHOW: "outline"
			};

		const labels: Record<Appointment["status"], string> = {
			SCHEDULED: "Scheduled",
			PENDING: "Pending",
			COMPLETED: "Completed",
			CANCELLED: "Cancelled",
			NO_SHOW: "No Show"
		};

		return <Badge variant={variants[status] || "default"}>{labels[status]}</Badge>;
	};

	const getAppointmentTypeIcon = (type: string) => {
		switch (type?.toLowerCase()) {
			case "video":
			case "telehealth":
				return <VideoIcon className='h-3 w-3' />;
			case "phone":
				return <PhoneIcon className='h-3 w-3' />;
			default:
				return <CalendarIcon className='h-3 w-3' />;
		}
	};

	const columns: ColumnDef<Appointment>[] = [
		{
			accessorKey: "patient",
			header: "Patient",
			cell: ({ row }) => {
				const appointment = row.original;
				const patient = appointment.patient;
				return (
					<div className='flex items-center gap-3'>
						<Avatar className='h-8 w-8'>
							{patient?.image ? (
								<AvatarImage
									alt={patient?.firstName}
									src={patient.image}
								/>
							) : null}
							<AvatarFallback>
								{patient ? getInitials(`${patient.firstName} ${patient.lastName}`) : "N/A"}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className='font-medium'>
								{patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient"}
							</div>
							<div className='text-muted-foreground text-sm'>
								{patient?.phone || patient?.email || "No contact"}
							</div>
						</div>
					</div>
				);
			}
		},
		{
			accessorKey: "doctor",
			header: "Doctor",
			cell: ({ row }) => {
				const appointment = row.original;
				const doctor = appointment.doctor;
				return (
					<div className='flex items-center gap-2'>
						{doctor?.colorCode && (
							<div
								className='h-2 w-2 rounded-full'
								style={{ backgroundColor: doctor.colorCode }}
							/>
						)}
						<div>
							<div className='font-medium'>Dr. {doctor?.name || "Unknown"}</div>
							<div className='text-muted-foreground text-xs'>{doctor?.specialty || "General"}</div>
						</div>
					</div>
				);
			}
		},
		{
			accessorKey: "appointmentDate",
			header: "Date & Time",
			cell: ({ row }) => {
				const appointment = row.original;
				return (
					<div>
						<div className='font-medium'>
							{format(new Date(appointment.appointmentDate), "MMM d, yyyy")}
						</div>
						<div className='flex items-center gap-1 text-muted-foreground text-sm'>
							<ClockIcon className='h-3 w-3' />
							{appointment.time || "Time TBD"}
							{appointment.durationMinutes && (
								<span className='text-xs'>({appointment.durationMinutes} min)</span>
							)}
						</div>
					</div>
				);
			},
			sortingFn: "datetime"
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => {
				const appointment = row.original;
				return (
					<div className='flex items-center gap-1'>
						{getAppointmentTypeIcon(appointment.type)}
						<span className='capitalize'>{appointment.type?.toLowerCase() || "Standard"}</span>
					</div>
				);
			}
		},
		{
			accessorKey: "service",
			header: "Service",
			cell: ({ row }) => {
				const appointment = row.original;
				const service = appointment.service;
				return (
					<div>
						<div className='text-sm'>{service?.serviceName || "General Consultation"}</div>
						{service?.price && <div className='text-muted-foreground text-xs'>${service.price}</div>}
					</div>
				);
			}
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => getStatusBadge(row.original.status)
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const appointment = row.original;
				const canEdit = appointment.status === "SCHEDULED" || appointment.status === "PENDING";
				const canStart = appointment.status === "SCHEDULED";

				return (
					<div className='flex items-center gap-2'>
						{canStart && (
							<Button
								aria-label='Start visit'
								as={Link}
								className='h-8'
								href={`/dashboard/medical-records/${appointment.id}`}
								size='sm'
								variant='default'
							>
								Start Visit
							</Button>
						)}

						<Button
							aria-label='View appointment'
							onClick={() => onView?.(appointment)}
							size='sm'
							variant='ghost'
						>
							<EyeIcon className='h-4 w-4' />
						</Button>

						{canEdit && (
							<Button
								aria-label='Edit appointment'
								onClick={() => onEdit?.(appointment)}
								size='sm'
								variant='ghost'
							>
								<PencilIcon className='h-4 w-4' />
							</Button>
						)}

						{canEdit && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										aria-label='Cancel appointment'
										className='text-red-600'
										size='sm'
										variant='ghost'
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to cancel the appointment with{" "}
											{appointment.patient?.firstName} {appointment.patient?.lastName}? This
											action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Keep Appointment</AlertDialogCancel>
										<AlertDialogAction
											className='bg-destructive text-destructive-foreground'
											onClick={() =>
												updateAppointmentStatus.mutate({
													id: appointment.id,
													status: "CANCELLED"
												})
											}
										>
											Cancel Appointment
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}

						{!canEdit && appointment.status === "COMPLETED" && (
							<Button
								aria-label='Delete appointment'
								className='text-red-600'
								onClick={() => {
									if (confirm("Delete this appointment record?")) {
										deleteAppointment.mutate({ id: appointment.id });
									}
								}}
								size='sm'
								variant='ghost'
							>
								<Trash2 className='h-4 w-4' />
							</Button>
						)}
					</div>
				);
			}
		}
	];

	// Quick status update dropdown
	const _statusOptions: { label: string; value: Appointment["status"]; color: string }[] = [
		{ label: "Scheduled", value: "SCHEDULED", color: "bg-blue-500" },
		{ label: "Pending", value: "PENDING", color: "bg-yellow-500" },
		{ label: "Completed", value: "COMPLETED", color: "bg-green-500" },
		{ label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
		{ label: "No Show", value: "NO_SHOW", color: "bg-gray-500" }
	];

	if (isLoading) {
		return <div className='flex justify-center p-8'>Loading appointments...</div>;
	}

	return (
		<DataTable
			actions={
				<div className='flex gap-2'>
					<Button
						as={Link}
						href='/dashboard/appointments/new'
						variant='default'
					>
						<PlusIcon className='mr-2 h-4 w-4' />
						New Appointment
					</Button>

					{/* Quick status filter could go here */}
				</div>
			}
			columns={columns}
			data={data?.items || []}
			label='Appointments'
			searchColumns={["patient.firstName", "patient.lastName", "doctor.name", "reason"]}
			searchPlaceholder='Search by patient or doctor...'
		/>
	);
}

// Sub-component for inline status update (if needed)
function _StatusDropdown({
	appointmentId,
	currentStatus,
	onUpdate
}: {
	appointmentId: string;
	currentStatus: Appointment["status"];
	onUpdate: (status: Appointment["status"]) => void;
}) {
	const statusOptions: { label: string; value: Appointment["status"]; color: string }[] = [
		{ label: "Scheduled", value: "SCHEDULED", color: "bg-blue-500" },
		{ label: "Pending", value: "PENDING", color: "bg-yellow-500" },
		{ label: "Completed", value: "COMPLETED", color: "bg-green-500" },
		{ label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
		{ label: "No Show", value: "NO_SHOW", color: "bg-gray-500" }
	];

	return (
		<select
			className='rounded-md border border-gray-300 px-2 py-1 text-sm'
			onChange={e => onUpdate(e.target.value as Appointment["status"])}
			value={currentStatus}
		>
			{statusOptions.map(opt => (
				<option
					key={opt.value}
					value={opt.value}
				>
					{opt.label}
				</option>
			))}
		</select>
	);
}
