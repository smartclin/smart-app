import { z } from 'zod'

import { getMedicalRecords } from '@/utils/services/medical-record' // adjust path to your service file

import { createTRPCRouter, protectedProcedure } from '../init' // adjust path as needed

// Input schema for pagination and search
const GetMedicalRecordsInputSchema = z.object({
	page: z.number().int().min(1),
	limit: z.number().int().min(1).optional(),
	search: z.string().optional(),
})

export const medicalRecordsRouter = createTRPCRouter({
	getMedicalRecords: protectedProcedure
		.input(GetMedicalRecordsInputSchema)
		.query(async ({ input }) => {
			// Your service function already handles the pagination logic
			return await getMedicalRecords(input)
		}),
})
