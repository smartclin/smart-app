import { z } from 'zod'

import { getVitalSignData } from '@/utils/services/medical' // adjust path to your service function

import { createTRPCRouter, protectedProcedure } from '../init' // adjust your import path

// Input schema: patient id as a string (assuming UUID or similar)
const PatientIdSchema = z.string().nonempty()

export const vitalSignsRouter = createTRPCRouter({
	getVitalSignData: protectedProcedure.input(PatientIdSchema).query(async ({ input }) => {
		// input is patientId string
		return await getVitalSignData(input)
	}),
})
