import type { Prisma } from '@prisma/client'

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
