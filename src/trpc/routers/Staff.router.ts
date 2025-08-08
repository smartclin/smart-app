import { z } from 'zod';

import { createReview } from '@/actions/general';
import { reviewSchema } from '@/lib/schema';
import { getAllStaff } from '@/utils/services/staff'; // adjust path to your service

import { createTRPCRouter, protectedProcedure } from '../init'; // adjust import path

// Input schema for pagination + search
const GetAllStaffInputSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).optional(),
  search: z.string().optional()
});

export const staffRouter = createTRPCRouter({
  getAllStaff: protectedProcedure.input(GetAllStaffInputSchema).query(async ({ input }) => {
    return await getAllStaff(input);
  }),
  createReview: protectedProcedure.input(reviewSchema).mutation(async ({ input }) => {
    const result = await createReview(input);
    if (!result.success) throw new Error(result.message || 'Failed to create review');
    return result;
  })
});
