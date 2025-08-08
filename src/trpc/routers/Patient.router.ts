import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createNewPatient, updatePatient } from '@/actions/patient'
import { PatientFormSchema } from '@/lib/schema'
import {
  getAllPatients,
  getPatientById,
  getPatientDashboardStatistics,
  getPatientFullDataById,
} from '@/utils/services/patient'

import { createTRPCRouter, protectedProcedure } from '../init'

export const patientRouter = createTRPCRouter({
  getPatientDashboardStatistics: protectedProcedure
    .input(z.string())
    .query(async ({ input: patientId }) => {
      try {
        return await getPatientDashboardStatistics(patientId)
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to fetch dashboard statistics',
        })
      }
    }),

  getPatientById: protectedProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      try {
        return (await getPatientById(id)).data
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to fetch patient by ID',
        })
      }
    }),

  getPatientFullDataById: protectedProcedure
    .input(z.string())
    .query(async ({ input: idOrEmail }) => {
      try {
        return await getPatientFullDataById(idOrEmail)
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to fetch full patient data',
        })
      }
    }),

  getAllPatients: protectedProcedure
    .input(
      z.object({
        page: z
          .union([z.string(), z.number()])
          .transform((v) => Math.max(1, Number(v))),
        limit: z.union([z.string(), z.number()]).transform(Number).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await getAllPatients(input)
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to fetch patients',
        })
      }
    }),

  createNewPatient: protectedProcedure
    .input(
      z.object({
        pid: z.string(),
        data: PatientFormSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { pid, data } = input
      return await createNewPatient(data, pid) // ✅ data is correctly typed now
    }),

  updatePatient: protectedProcedure
    .input(
      z.object({
        pid: z.string(),
        data: PatientFormSchema, // same schema used on the server
      }),
    )
    .mutation(async ({ input }) => {
      const { pid, data } = input

      const payload = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      }

      return await updatePatient(payload, pid)
    }),
})
