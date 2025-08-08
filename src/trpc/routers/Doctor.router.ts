import { z } from 'zod';

import {
  getAllDoctors,
  getAvailableDoctors,
  getDoctorById,
  getDoctorDashboardStats,
  getDoctors,
  getRatingById
} from '@/utils/services/doctor'; // adjust path to your doctor service file

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../init'; // adjust import path

// Input schemas

const DoctorIdSchema = z.string().uuid(); // adjust if not UUID

const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).optional(),
  search: z.string().optional()
});

// Router

export const doctorRouter = createTRPCRouter({
  // Returns all doctors - no pagination
  getDoctors: publicProcedure.query(async () => {
    return await getDoctors();
  }),

  // Paginated & filtered list of doctors
  getAllDoctors: publicProcedure.input(PaginationSchema).query(async ({ input }) => {
    return await getAllDoctors(input);
  }),

  getDoctorDashboardStats: protectedProcedure.query(async () => {
    return await getDoctorDashboardStats();
  }),

  getDoctorById: publicProcedure.input(DoctorIdSchema).query(async ({ input }) => {
    return await getDoctorById(input);
  }),

  getRatingById: publicProcedure.input(DoctorIdSchema).query(async ({ input }) => {
    return await getRatingById(input);
  }),

  getAvailableDoctors: publicProcedure.query(async () => {
    return await getAvailableDoctors();
  })
});
