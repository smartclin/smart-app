import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import {
	Calendar as CalendarIcon,
	CheckCircle,
	Clock,
	Download,
	Mail,
	MoreVertical,
	Clock as PendingIcon,
	Phone,
	Plus,
	RefreshCw,
	Search,
	Stethoscope,
	User,
	XCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "#/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { orpc } from "#/orpc/client";
import { getSession } from "@/lib/auth-functions";

import { generateId } from "../../lib/id";

// Type definitions
type Appointment = {
	id: string;
	patientId: string;
	doctorId: string;
	appointmentDate: Date;
	time?: string;
	status: "PENDING" | "COMPLETED" | "CANCELLED" | "CONFIRMED" | "NO_SHOW";
	reason?: string;
	notes?: string;
	type?: string;
	patient?: {
		id: string;
		firstName: string;
		lastName: string;
		phone?: string;
		email?: string;
	};
	doctor?: {
		id: string;
		name: string;
		specialty: string;
	};
};

type Patient = {
	id: string;
	firstName: string;
	lastName: string;
};

type Doctor = {
	id: string;
	name: string;
	specialty: string;
};

export const Route = createFileRoute("/dashboard/appointments")({
	component: AppointmentsPage,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/auth/sign-in", search: { redirect: "/dashboard" } });
		}
	},
	loader: async ({ context }) => {
		const today = new Date();
		await Promise.all([
			context.queryClient.prefetchQuery(
				orpc.appointments.getByDateRange.queryOptions({
					input: {
						startDate: today,
						endDate: new Date(today.setHours(23, 59, 59, 999))
					}
				})
			),
			context.queryClient.prefetchQuery(
				orpc.doctors.getAvailable.queryOptions({
					input: { date: today }
				})
			),
			context.queryClient.prefetchQuery(
				orpc.patients.list.queryOptions({
					input: { page: 1, limit: 100 }
				})
			)
		]);
	}
});

function AppointmentsPage() {
	const queryClient = useQueryClient();
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [view, setView] = useState<"day" | "week" | "month">("day");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Query appointments with filters
	const getDateRange = () => {
		if (view === "day") {
			const endDate = new Date(selectedDate);
			endDate.setHours(23, 59, 59, 999);
			return {
				startDate: selectedDate,
				endDate: endDate
			};
		}
		if (view === "week") {
			const start = startOfWeek(selectedDate);
			const end = endOfWeek(selectedDate);
			return { startDate: start, endDate: end };
		}
		const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
		const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
		end.setHours(23, 59, 59, 999);
		return { startDate: start, endDate: end };
	};

	const { data: appointments, refetch: refetchAppointments } = useQuery(
		orpc.appointments.getByDateRange.queryOptions({
			input: getDateRange()
		})
	);

	const { data: availableDoctors } = useQuery(
		orpc.doctors.getAvailable.queryOptions({
			input: { date: selectedDate }
		})
	);

	const { data: patients } = useQuery(
		orpc.patients.list.queryOptions({
			input: { page: 1, limit: 100 }
		})
	);

	// Mutations
	const createAppointment = useMutation({
		mutationFn: (data: {
			patientId: string;
			doctorId: string;
			appointmentDate: Date;
			time: string;
			reason?: string;
			notes?: string;
			type: string;
		}) =>
			orpc.appointments.create.call({
				...data,
				id: generateId(),
				clinicId: "", // Populated server-side
				type: data.type || "Checkup"
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
			setIsCreateModalOpen(false);
			toast.success("Appointment created successfully!");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create appointment: ${error.message}`);
		}
	});

	const updateAppointmentStatus = useMutation({
		mutationFn: (data: { id: string; status: Appointment["status"] }) => orpc.appointments.update.call(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
			toast.success("Appointment status updated!");
		},
		onError: (error: Error) => {
			toast.error(`Failed to update appointment: ${error.message}`);
		}
	});

	// Filter appointments
	const filteredAppointments = (appointments as Appointment[])?.filter(apt => {
		const matchesDoctor = selectedDoctor === "all" || apt.doctorId === selectedDoctor;
		const matchesStatus = selectedStatus === "all" || apt.status === selectedStatus;
		const matchesSearch =
			!searchQuery ||
			apt.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			apt.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			apt.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesDoctor && matchesStatus && matchesSearch;
	});

	// Group appointments by time slot
	const groupedAppointments = filteredAppointments?.reduce(
		(groups, apt) => {
			const hour = apt.time?.split(":")[0] || "00";
			if (!groups[hour]) groups[hour] = [];
			groups[hour].push(apt);
			return groups;
		},
		{} as Record<string, Appointment[]>
	);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "CONFIRMED":
				return <PendingIcon className='h-4 w-4 text-yellow-500' />;
			case "COMPLETED":
				return <CheckCircle className='h-4 w-4 text-green-500' />;
			case "CANCELLED":
				return <XCircle className='h-4 w-4 text-red-500' />;
			default:
				return <Clock className='h-4 w-4 text-gray-500' />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "CONFIRMED":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "COMPLETED":
				return "bg-green-100 text-green-800 border-green-200";
			case "CANCELLED":
				return "bg-red-100 text-red-800 border-red-200";
			case "PENDING":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 p-6'>
			{/* Header */}
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='font-bold text-3xl text-gray-900'>Appointments</h1>
					<p className='mt-1 text-gray-500'>Manage and schedule patient appointments</p>
				</div>
				<div className='flex gap-3'>
					<Button
						onClick={() => refetchAppointments()}
						variant='outline'
					>
						<RefreshCw className='mr-2 h-4 w-4' />
						Refresh
					</Button>
					<Button onClick={() => setIsCreateModalOpen(true)}>
						<Plus className='mr-2 h-4 w-4' />
						New Appointment
					</Button>
				</div>
			</div>

			{/* Filters Bar */}
			<Card className='mb-6'>
				<CardContent className='p-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
						<div className='relative'>
							<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
							<Input
								className='pl-10'
								onChange={e => setSearchQuery(e.target.value)}
								placeholder='Search patients or doctors...'
								value={searchQuery}
							/>
						</div>

						<Select
							onValueChange={setSelectedDoctor}
							value={selectedDoctor}
						>
							<SelectTrigger>
								<SelectValue placeholder='Filter by doctor' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Doctors</SelectItem>
								{(availableDoctors as Doctor[])?.map(doctor => (
									<SelectItem
										key={doctor.id}
										value={doctor.id}
									>
										Dr. {doctor.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							onValueChange={setSelectedStatus}
							value={selectedStatus}
						>
							<SelectTrigger>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='CONFIRMED'>Confirmed</SelectItem>
								<SelectItem value='PENDING'>Pending</SelectItem>
								<SelectItem value='COMPLETED'>Completed</SelectItem>
								<SelectItem value='CANCELLED'>Cancelled</SelectItem>
							</SelectContent>
						</Select>

						<div className='flex gap-2'>
							<Button
								className='flex-1'
								onClick={() => setView("day")}
								variant={view === "day" ? "default" : "outline"}
							>
								Day
							</Button>
							<Button
								className='flex-1'
								onClick={() => setView("week")}
								variant={view === "week" ? "default" : "outline"}
							>
								Week
							</Button>
							<Button
								className='flex-1'
								onClick={() => setView("month")}
								variant={view === "month" ? "default" : "outline"}
							>
								Month
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Content */}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				{/* Calendar Sidebar */}
				<div className='lg:col-span-1'>
					<Card>
						<CardHeader>
							<CardTitle>Calendar</CardTitle>
						</CardHeader>
						<CardContent>
							<Calendar
								className='rounded-md border'
								mode='single'
								modifiers={{
									hasAppointments:
										(appointments as Appointment[])?.map(apt => new Date(apt.appointmentDate)) || []
								}}
								modifiersClassNames={{
									hasAppointments: "bg-primary/10 font-bold"
								}}
								onSelect={date => date && setSelectedDate(date)}
								selected={selectedDate}
							/>

							<div className='mt-6'>
								<h4 className='mb-3 font-medium'>Quick Stats</h4>
								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span className='text-gray-500'>Total Today:</span>
										<span className='font-semibold'>
											{(appointments as Appointment[])?.filter(apt =>
												isSameDay(new Date(apt.appointmentDate), selectedDate)
											).length || 0}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span className='text-gray-500'>Completed:</span>
										<span className='font-semibold text-green-600'>
											{(appointments as Appointment[])?.filter(
												apt =>
													isSameDay(new Date(apt.appointmentDate), selectedDate) &&
													apt.status === "COMPLETED"
											).length || 0}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span className='text-gray-500'>Pending:</span>
										<span className='font-semibold text-yellow-600'>
											{(appointments as Appointment[])?.filter(
												apt =>
													isSameDay(new Date(apt.appointmentDate), selectedDate) &&
													apt.status === "PENDING"
											).length || 0}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Appointments List */}
				<div className='lg:col-span-2'>
					<Card>
						<CardHeader className='border-b'>
							<div className='flex items-center justify-between'>
								<CardTitle>
									{view === "day" && format(selectedDate, "EEEE, MMMM d, yyyy")}
									{view === "week" &&
										`Week of ${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d, yyyy")}`}
									{view === "month" && format(selectedDate, "MMMM yyyy")}
								</CardTitle>
								<div className='text-gray-500 text-sm'>
									{filteredAppointments?.length || 0} appointments
								</div>
							</div>
						</CardHeader>
						<CardContent className='p-0'>
							<ScrollArea className='h-150'>
								{view === "day" ? (
									// Day view - grouped by hour
									<div className='divide-y'>
										{Array.from({ length: 12 }, (_, i) => i + 9).map(hour => {
											const hourStr = hour.toString().padStart(2, "0");
											const hourAppointments = groupedAppointments?.[hourStr] || [];

											return (
												<div
													className='p-4 hover:bg-gray-50'
													key={hour}
												>
													<div className='mb-3 flex items-center gap-3'>
														<Clock className='h-4 w-4 text-gray-400' />
														<span className='font-medium text-gray-700'>
															{hour}:00 - {hour + 1}:00
														</span>
														<Badge
															className='text-xs'
															variant='outline'
														>
															{hourAppointments.length} appointments
														</Badge>
													</div>
													<div className='space-y-3 pl-7'>
														{hourAppointments.map(apt => (
															<AppointmentCard
																appointment={apt}
																getStatusColor={getStatusColor}
																getStatusIcon={getStatusIcon}
																key={apt.id}
																onStatusChange={(status: Appointment["status"]) =>
																	updateAppointmentStatus.mutate({
																		id: apt.id,
																		status
																	})
																}
															/>
														))}
														{hourAppointments.length === 0 && (
															<div className='py-2 text-gray-400 text-sm italic'>
																No appointments scheduled
															</div>
														)}
													</div>
												</div>
											);
										})}
									</div>
								) : (
									// Week/Month view - flat list
									<div className='divide-y'>
										{filteredAppointments?.map(apt => (
											<AppointmentCard
												appointment={apt}
												getStatusColor={getStatusColor}
												getStatusIcon={getStatusIcon}
												key={apt.id}
												onStatusChange={(status: Appointment["status"]) =>
													updateAppointmentStatus.mutate({ id: apt.id, status })
												}
											/>
										))}
										{(!filteredAppointments || filteredAppointments.length === 0) && (
											<div className='py-12 text-center'>
												<CalendarIcon className='mx-auto mb-3 h-12 w-12 text-gray-300' />
												<p className='text-gray-500'>No appointments found</p>
												<Button
													className='mt-4'
													onClick={() => setIsCreateModalOpen(true)}
													variant='outline'
												>
													Schedule an appointment
												</Button>
											</div>
										)}
									</div>
								)}
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Create Appointment Modal */}
			<CreateAppointmentModal
				doctors={(availableDoctors as Doctor[]) || []}
				onCreateAppointment={data => createAppointment.mutate(data)}
				onOpenChange={setIsCreateModalOpen}
				open={isCreateModalOpen}
				patients={(patients?.patients as Patient[]) || []}
				selectedDate={selectedDate}
			/>
		</div>
	);
}

// Appointment Card Component
function AppointmentCard({
	appointment,
	onStatusChange,
	getStatusColor,
	getStatusIcon
}: {
	appointment: Appointment;
	onStatusChange: (status: Appointment["status"]) => void;
	getStatusColor: (status: string) => string;
	getStatusIcon: (status: string) => React.ReactNode;
}) {
	const [showDetails, setShowDetails] = useState(false);

	return (
		<div className='rounded-lg border bg-white p-4 transition-shadow hover:shadow-md'>
			<div className='flex items-start justify-between'>
				<div className='flex-1'>
					<div className='mb-2 flex items-center gap-3'>
						<div
							className={`rounded-full border px-2 py-1 font-medium text-xs ${getStatusColor(appointment.status)}`}
						>
							<span className='flex items-center gap-1'>
								{getStatusIcon(appointment.status)}
								{appointment.status}
							</span>
						</div>
						<span className='flex items-center gap-1 text-gray-500 text-sm'>
							<Clock className='h-3 w-3' />
							{appointment.time || "Time TBD"}
						</span>
					</div>

					<div className='mb-3 grid grid-cols-2 gap-4'>
						<div className='flex items-center gap-2'>
							<User className='h-4 w-4 text-gray-400' />
							<div>
								<p className='font-medium'>
									{appointment.patient?.firstName} {appointment.patient?.lastName}
								</p>
								<p className='text-gray-500 text-xs'>Patient</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<Stethoscope className='h-4 w-4 text-gray-400' />
							<div>
								<p className='font-medium'>Dr. {appointment.doctor?.name}</p>
								<p className='text-gray-500 text-xs'>{appointment.doctor?.specialty}</p>
							</div>
						</div>
					</div>

					{appointment.reason && (
						<p className='mb-2 text-gray-600 text-sm'>
							<span className='font-medium'>Reason:</span> {appointment.reason}
						</p>
					)}

					{/* Expandable Details */}
					{showDetails && (
						<div className='mt-3 space-y-2 border-t pt-3 text-sm'>
							{appointment.patient?.phone && (
								<div className='flex items-center gap-2'>
									<Phone className='h-3 w-3 text-gray-400' />
									<span>{appointment.patient.phone}</span>
								</div>
							)}
							{appointment.patient?.email && (
								<div className='flex items-center gap-2'>
									<Mail className='h-3 w-3 text-gray-400' />
									<span>{appointment.patient.email}</span>
								</div>
							)}
							{appointment.notes && (
								<div className='flex items-start gap-2'>
									<span className='font-medium'>Notes:</span>
									<span className='text-gray-600'>{appointment.notes}</span>
								</div>
							)}
						</div>
					)}
				</div>

				<div className='flex items-center gap-2'>
					{appointment.status === "CONFIRMED" && (
						<Button
							onClick={() => (window.location.href = `/dashboard/medical-records/${appointment.id}`)}
							size='sm'
							variant='outline'
						>
							Start Visit
						</Button>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size='sm'
								variant='ghost'
							>
								<MoreVertical className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
								{showDetails ? "Hide Details" : "View Details"}
							</DropdownMenuItem>
							{appointment.status === "CONFIRMED" && (
								<DropdownMenuItem onClick={() => onStatusChange("COMPLETED")}>
									<CheckCircle className='mr-2 h-4 w-4 text-green-500' />
									Mark as Completed
								</DropdownMenuItem>
							)}
							{appointment.status === "CONFIRMED" && (
								<DropdownMenuItem
									className='text-red-600'
									onClick={() => onStatusChange("CANCELLED")}
								>
									<XCircle className='mr-2 h-4 w-4' />
									Cancel Appointment
								</DropdownMenuItem>
							)}
							<DropdownMenuItem>
								<Download className='mr-2 h-4 w-4' />
								Export Details
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}

// Create Appointment Modal Component
function CreateAppointmentModal({
	open,
	onOpenChange,
	patients,
	doctors,
	onCreateAppointment,
	selectedDate
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	patients: Patient[];
	doctors: Doctor[];
	onCreateAppointment: (data: {
		patientId: string;
		doctorId: string;
		appointmentDate: Date;
		time: string;
		reason: string;
		notes: string;
		type: string;
	}) => void;
	selectedDate: Date;
}) {
	const [formData, setFormData] = useState({
		patientId: "",
		doctorId: "",
		appointmentDate: selectedDate,
		time: "09:00",
		reason: "",
		notes: "",
		type: "Checkup"
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onCreateAppointment(formData);
		onOpenChange(false);
	};

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Schedule New Appointment</DialogTitle>
				</DialogHeader>

				<form
					className='space-y-4'
					onSubmit={handleSubmit}
				>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label>Patient *</Label>
							<Select
								onValueChange={value => setFormData({ ...formData, patientId: value })}
								value={formData.patientId}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select patient' />
								</SelectTrigger>
								<SelectContent>
									{patients.map(patient => (
										<SelectItem
											key={patient.id}
											value={patient.id}
										>
											{patient.firstName} {patient.lastName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Doctor *</Label>
							<Select
								onValueChange={value => setFormData({ ...formData, doctorId: value })}
								value={formData.doctorId}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select doctor' />
								</SelectTrigger>
								<SelectContent>
									{doctors.map(doctor => (
										<SelectItem
											key={doctor.id}
											value={doctor.id}
										>
											Dr. {doctor.name} - {doctor.specialty}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label>Date *</Label>
							<Input
								onChange={e =>
									setFormData({
										...formData,
										appointmentDate: new Date(e.target.value)
									})
								}
								type='date'
								value={format(formData.appointmentDate, "yyyy-MM-dd")}
							/>
						</div>

						<div>
							<Label>Time *</Label>
							<Input
								onChange={e => setFormData({ ...formData, time: e.target.value })}
								type='time'
								value={formData.time}
							/>
						</div>
					</div>

					<div>
						<Label>Appointment Type</Label>
						<Select
							onValueChange={value => setFormData({ ...formData, type: value })}
							value={formData.type}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='Checkup'>Checkup</SelectItem>
								<SelectItem value='Follow-up'>Follow-up</SelectItem>
								<SelectItem value='Consultation'>Consultation</SelectItem>
								<SelectItem value='Emergency'>Emergency</SelectItem>
								<SelectItem value='Vaccination'>Vaccination</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Reason for visit</Label>
						<Input
							onChange={e => setFormData({ ...formData, reason: e.target.value })}
							placeholder='What brings the patient in today?'
							value={formData.reason}
						/>
					</div>

					<div>
						<Label>Additional Notes</Label>
						<Textarea
							onChange={e => setFormData({ ...formData, notes: e.target.value })}
							placeholder='Any additional information...'
							rows={3}
							value={formData.notes}
						/>
					</div>

					<div className='flex justify-end gap-3 pt-4'>
						<Button
							onClick={() => onOpenChange(false)}
							type='button'
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={!formData.patientId || !formData.doctorId}
							type='submit'
						>
							Schedule Appointment
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
