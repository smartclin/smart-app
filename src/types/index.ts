// src/types/prisma-utils.ts (or a suitable location for shared types)

import type { Prisma } from '@prisma/client' // Import Prisma types for WhereInput and OrderByInput

export * from './user'
export interface SearchParamsProps {
	searchParams?: Promise<{ [key: string]: string | undefined }>
}

export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type EmptyProps<T extends React.ElementType> = Omit<
	React.ComponentProps<T>,
	keyof React.ComponentProps<T>
>

export interface SearchParams {
	[key: string]: string | string[] | undefined
}

/**
 * Defines options for building Prisma queries.
 *
 * @template TWhere The Prisma `WhereInput` type for the specific model (e.g., `Prisma.UserWhereInput`).
 * @template TOrderBy The Prisma `OrderByWithRelationInput` type for the specific model (e.g., `Prisma.UserOrderByWithRelationInput`).
 */
export interface QueryBuilderOpts<TWhere, TOrderBy> {
	where?: TWhere
	orderBy?: TOrderBy | TOrderBy[] // Prisma's orderBy can accept a single object or an array of objects
	distinct?: boolean // Prisma supports `distinct`
	nullish?: boolean // This seems like a custom flag, keep as is
}
export type StaffQueryOptions = QueryBuilderOpts<
	Prisma.StaffWhereInput,
	Prisma.StaffOrderByWithRelationInput
>
export type PatientQueryOptions = QueryBuilderOpts<
	Prisma.PatientWhereInput,
	Prisma.PatientOrderByWithRelationInput
>
export type DoctorQueryOptions = QueryBuilderOpts<
	Prisma.DoctorWhereInput,
	Prisma.DoctorOrderByWithRelationInput
>
export type AppointmentQueryOptions = QueryBuilderOpts<
	Prisma.AppointmentWhereInput,
	Prisma.AppointmentOrderByWithRelationInput
>
export type PaymentQueryOptions = QueryBuilderOpts<
	Prisma.PaymentWhereInput,
	Prisma.PaymentOrderByWithRelationInput
>
export type PrescriptionQueryOptions = QueryBuilderOpts<
	Prisma.PrescriptionWhereInput,
	Prisma.PrescriptionOrderByWithRelationInput
>

// Example usage (for context, not part of the file):
/*
import { Prisma } from '@prisma/client';

// If you were building a query for the 'Staff' model:
type StaffQueryOptions = QueryBuilderOpts<Prisma.StaffWhereInput, Prisma.StaffOrderByWithRelationInput>;

// And then in your service function:
async function getStaff(options: StaffQueryOptions) {
  const staff = await db.staff.findMany({
    where: options.where,
    orderBy: options.orderBy,
    // ... other options
  });
}
*/
