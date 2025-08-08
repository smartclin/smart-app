import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '@/trpc/routers/_app'

type PatientRouterInput = inferRouterInputs<AppRouter>['patient']
type PatientRouterOutput = inferRouterOutputs<AppRouter>['patient']

// ✅ INPUT types
export type CreateNewPatientInput = PatientRouterInput['createNewPatient']
export type UpdatePatientInput = PatientRouterInput['updatePatient']
export type GetPatientByIdInput = PatientRouterInput['getPatientById']
export type GetPatientFullDataByIdInput =
  PatientRouterInput['getPatientFullDataById']
export type GetPatientDashboardStatisticsInput =
  PatientRouterInput['getPatientDashboardStatistics']
export type GetAllPatientsInput = PatientRouterInput['getAllPatients']

// ✅ OUTPUT types
export type CreateNewPatientOutput = PatientRouterOutput['createNewPatient']
export type UpdatePatientOutput = PatientRouterOutput['updatePatient']
export type GetPatientByIdOutput = PatientRouterOutput['getPatientById']
export type GetPatientFullDataByIdOutput =
  PatientRouterOutput['getPatientFullDataById']
export type GetPatientDashboardStatisticsOutput =
  PatientRouterOutput['getPatientDashboardStatistics']
export type GetAllPatientsOutput = PatientRouterOutput['getAllPatients']
