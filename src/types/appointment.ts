import type { inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '@/trpc/routers/_app'

type AppointmentRouterOutput = inferRouterOutputs<AppRouter>['appointment']

export type GetAppointmentByIdOutput =
  AppointmentRouterOutput['getAppointmentById']
export type GetPatientAppointmentsOutput =
  AppointmentRouterOutput['getPatientAppointments']
export type GetAppointmentWithMedicalRecordsByIdOutput =
  AppointmentRouterOutput['getAppointmentWithMedicalRecordsById']
export type CreateNewAppointmentOutput =
  AppointmentRouterOutput['createNewAppointment']
export type AppointmentActionOutput =
  AppointmentRouterOutput['appointmentAction']
export type AddVitalSignsOutput = AppointmentRouterOutput['addVitalSigns']
