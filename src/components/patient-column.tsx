import type { ColumnDef } from "@tanstack/react-table";
import { Activity, ArrowUpDown, Calendar, Eye, Link, Mail, MoreHorizontal, Phone, Syringe } from "lucide-react";

import type { Patient } from "@/orpc/schema";
import { getInitials } from "@/utils";
import { getAge } from "@/utils/growth";

import { getBloodGroupBadge, getStatusBadge } from "./Badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "./ui/dropdown-menu";

export const columns: ColumnDef<Patient>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					variant='ghost'
				>
					Patient Name
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},
		cell: ({ row }) => {
			const patient = row.original;
			return (
				<div className='flex items-center gap-3'>
					<Avatar className='h-10 w-10'>
						<AvatarFallback className='bg-teal-100 text-teal-700'>
							{getInitials(patient.firstName, patient.lastName)}
						</AvatarFallback>
					</Avatar>
					<div className='flex flex-col'>
						<span className='font-medium'>
							{patient.firstName} {patient.lastName}
						</span>
						<span className='text-muted-foreground text-xs'>
							{patient.email || patient.phone || "No contact"}
						</span>
					</div>
				</div>
			);
		}
	},
	{
		accessorKey: "dateOfBirth",
		header: ({ column }) => {
			return (
				<Button
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					variant='ghost'
				>
					Age
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},
		cell: ({ row }) => {
			const age = getAge(row.original.dateOfBirth.toISOString());
			const dob = new Date(row.original.dateOfBirth).toLocaleDateString();
			return (
				<div>
					<div className='font-medium'>{age}</div>
					<div className='text-muted-foreground text-xs'>Born: {dob}</div>
				</div>
			);
		}
	},
	{
		accessorKey: "gender",
		header: "Gender",
		cell: ({ row }) => {
			const gender = row.original.gender;
			return (
				<div className='flex items-center gap-1'>
					{gender === "MALE" && <span>♂️ Male</span>}
					{gender === "FEMALE" && <span>♀️ Female</span>}
					{(!gender || gender === "OTHER") && <span className='text-gray-400'>—</span>}
				</div>
			);
		}
	},
	{
		accessorKey: "bloodGroup",
		header: "Blood Type",
		cell: ({ row }) => getBloodGroupBadge(row.original.bloodGroup)
	},
	{
		accessorKey: "phone",
		header: "Contact",
		cell: ({ row }) => {
			const patient = row.original;
			return (
				<div className='flex flex-col gap-0.5'>
					{patient.phone && (
						<div className='flex items-center gap-1 text-sm'>
							<Phone className='h-3 w-3 text-gray-400' />
							<span>{patient.phone}</span>
						</div>
					)}
					{patient.email && (
						<div className='flex items-center gap-1 text-gray-500 text-xs'>
							<Mail className='h-3 w-3' />
							<span className='max-w-[150px] truncate'>{patient.email}</span>
						</div>
					)}
				</div>
			);
		}
	},
	{
		accessorKey: "lastVisit",
		header: "Last Visit",
		cell: ({ row }) => {
			// lastVisit is not in the schema, using updatedAt as a fallback or placeholder
			const date = row.original.updatedAt;
			if (!date) return <span className='text-gray-400'>Never</span>;
			return <div className='text-sm'>{new Date(date).toLocaleDateString()}</div>;
		}
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => getStatusBadge(row.original.status, row.original.isActive?? true)
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const patient = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className='h-8 w-8 p-0'
							variant='ghost'
						>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem asChild>
							<Link
								className='cursor-pointer'
								to={`/dashboard/patients/${patient.id}`}
							>
								<Eye className='mr-2 h-4 w-4' />
								View Details
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link
								className='cursor-pointer'
								to={`/dashboard/appointments/new?patientId=${patient.id}`}
							>
								<Calendar className='mr-2 h-4 w-4' />
								Schedule Appointment
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link
								className='cursor-pointer'
								to={`/dashboard/immunizations/record?patientId=${patient.id}`}
							>
								<Syringe className='mr-2 h-4 w-4' />
								Record Immunization
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link
								className='cursor-pointer'
								to={`/dashboard/growth/record?patientId=${patient.id}`}
							>
								<Activity className='mr-2 h-4 w-4' />
								Add Growth Measurement
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link
								className='cursor-pointer'
								to={`/dashboard/patients/${patient.id}/edit`}
							>
								Edit Patient
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];
