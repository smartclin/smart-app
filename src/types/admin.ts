import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/trpc/routers/_app';

type AdminRouterInput = inferRouterInputs<AppRouter>['admin'];
type AdminRouterOutput = inferRouterOutputs<AppRouter>['admin'];

// Input types
export type CreateNewStaffInput = AdminRouterInput['createNewStaff'];
export type CreateNewDoctorInput = AdminRouterInput['createNewDoctor'];
export type AddNewServiceInput = AdminRouterInput['addNewService'];
export type DeleteDataInput = AdminRouterInput['deleteData'];

// Output types
export type GetAdminDashboardStatsOutput = AdminRouterOutput['getAdminDashboardStats'];
export type GetServicesOutput = AdminRouterOutput['getServices'];
export type CreateNewStaffOutput = AdminRouterOutput['createNewStaff'];
export type CreateNewDoctorOutput = AdminRouterOutput['createNewDoctor'];
export type AddNewServiceOutput = AdminRouterOutput['addNewService'];
export type DeleteDataOutput = AdminRouterOutput['deleteData'];
