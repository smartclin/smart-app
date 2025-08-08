import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '@/trpc/routers/_app'

type VitalSignsRouterInput = inferRouterInputs<AppRouter>['vitalSigns']
type VitalSignsRouterOutput = inferRouterOutputs<AppRouter>['vitalSigns']

// Input type
export type GetVitalSignDataInput = VitalSignsRouterInput['getVitalSignData']

// Output type
export type GetVitalSignDataOutput = VitalSignsRouterOutput['getVitalSignData']
