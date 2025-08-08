import { z } from 'zod'

import { addDiagnosis, addNewBill, generateBill } from '@/actions/medical'
import {
  AddNewBillInputSchema,
  DiagnosisSchema,
  PaymentSchema,
} from '@/lib/schema'
import { getPaymentRecords } from '@/utils/services/payments' // adjust to your service function path

import { createTRPCRouter, protectedProcedure } from '../init' // adjust import path

// Input schema for pagination and search
const GetPaymentRecordsInputSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).optional(),
  search: z.string().optional(),
})

const AddDiagnosisInputSchema = DiagnosisSchema.extend({
  appointmentId: z.string(), // string id of appointment
})

export const paymentsRouter = createTRPCRouter({
  getPaymentRecords: protectedProcedure
    .input(GetPaymentRecordsInputSchema)
    .query(async ({ input }) => {
      return await getPaymentRecords(input)
    }),
  addDiagnosis: protectedProcedure
    .input(AddDiagnosisInputSchema)
    .mutation(async ({ input }) => {
      // Extract appointmentId separately
      const { appointmentId, ...diagnosisData } = input

      const result = await addDiagnosis(diagnosisData, appointmentId)

      if (!result.success)
        throw new Error(result.message || 'Failed to add diagnosis')
      return result
    }),

  addNewBill: protectedProcedure
    .input(AddNewBillInputSchema)
    .mutation(async ({ input }) => {
      const result = await addNewBill(input)
      if (!result.success) throw new Error(result.msg || 'Failed to add bill')
      return result
    }),

  generateBill: protectedProcedure
    .input(PaymentSchema)
    .mutation(async ({ input }) => {
      const result = await generateBill(input)
      if (!result.success)
        throw new Error(result.msg || 'Failed to generate bill')
      return result
    }),
})
