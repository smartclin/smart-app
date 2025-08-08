import { z } from 'zod';

import { addNewService, createNewDoctor, createNewStaff } from '@/actions/admin';
import { deleteDataById } from '@/actions/general';
import { DoctorSchema, ServicesSchema, StaffSchema, workingDaySchema } from '@/lib/schema';
import { getAdminDashboardStats, getServices } from '@/utils/services/admin'; // Adjust the path as needed

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../init';

const StaffInputSchema = StaffSchema;
const ServiceInputSchema = ServicesSchema;
const DoctorAuthSchema = DoctorSchema.extend({
  password: z.string().min(6, 'Password should be at least 6 characters long')
});
const deleteInputSchema = z.object({
  id: z.string(),
  deleteType: z.enum(['doctor', 'staff', 'patient', 'payment', 'bill'])
});
const CreateNewDoctorInputSchema = DoctorAuthSchema.extend({
  workSchedule: z.array(workingDaySchema)
});

export const adminRouter = createTRPCRouter({
  getAdminDashboardStats: publicProcedure.query(async () => {
    return await getAdminDashboardStats();
  }),

  getServices: publicProcedure.query(async () => {
    return await getServices();
  }),

  createNewStaff: protectedProcedure.input(StaffInputSchema).mutation(async ({ input }) => {
    // Optionally validate again here: StaffSchema.parse(input);

    const result = await createNewStaff(input);
    if (!result.success) throw new Error(result.msg || 'Failed to add staff');
    return result;
  }),

  createNewDoctor: protectedProcedure
    .input(CreateNewDoctorInputSchema)
    .mutation(async ({ input }) => {
      // The input here must conform exactly to the shape `createNewDoctor` expects:
      // a flat structure with workSchedule as WorkScheduleInput[]

      const result = await createNewDoctor(input as Parameters<typeof createNewDoctor>[0]);
      if (!result.success) throw new Error(result.message || 'Failed to add doctor');
      return result;
    }),

  addNewService: protectedProcedure.input(ServiceInputSchema).mutation(async ({ input }) => {
    const result = await addNewService(input);
    if (!result.success) throw new Error(result.msg || 'Failed to add service');
    return result;
  }),
  deleteData: protectedProcedure.input(deleteInputSchema).mutation(async ({ input, ctx }) => {
    // Check admin role, assuming ctx.user exists:
    if (ctx.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const { id, deleteType } = input;

    return await deleteDataById(id, deleteType);
  })
});
