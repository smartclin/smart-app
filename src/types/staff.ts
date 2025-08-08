import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/trpc/routers/_app';

type StaffRouterInput = inferRouterInputs<AppRouter>['staff'];
type StaffRouterOutput = inferRouterOutputs<AppRouter>['staff'];

// ✅ INPUT types
export type GetAllStaffInput = StaffRouterInput['getAllStaff'];
export type CreateReviewInput = StaffRouterInput['createReview'];

// ✅ OUTPUT types
export type GetAllStaffOutput = StaffRouterOutput['getAllStaff'];
export type CreateReviewOutput = StaffRouterOutput['createReview'];
