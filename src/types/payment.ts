import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/trpc/routers/_app';

type PaymentsRouterOutput = inferRouterOutputs<AppRouter>['payment'];
type PaymentsRouterInput = inferRouterInputs<AppRouter>['payment'];

// ✅ Output types
export type GetPaymentRecordsOutput = PaymentsRouterOutput['getPaymentRecords'];
export type AddDiagnosisOutput = PaymentsRouterOutput['addDiagnosis'];
export type AddNewBillOutput = PaymentsRouterOutput['addNewBill'];
export type GenerateBillOutput = PaymentsRouterOutput['generateBill'];

// ✅ Input types
export type GetPaymentRecordsInput = PaymentsRouterInput['getPaymentRecords'];
export type AddDiagnosisInput = PaymentsRouterInput['addDiagnosis'];
export type AddNewBillInput = PaymentsRouterInput['addNewBill'];
export type GenerateBillInput = PaymentsRouterInput['generateBill'];
