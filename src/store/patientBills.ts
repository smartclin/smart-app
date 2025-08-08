import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PatientBill {
  id: number
  billId: number
  serviceId: number
  serviceDate: string
  quantity: number
  unitCost: number
  totalCost: number
  createdAt: string
  updatedAt: string
}

interface PatientBillsStore {
  bills: PatientBill[]
  addBill: (bill: PatientBill) => void
  updateBill: (id: number, updated: Partial<PatientBill>) => void
  removeBill: (id: number) => void
}

export const usePatientBillsStore = create<PatientBillsStore>()(
  persist(
    (set) => ({
      bills: [],
      addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),
      updateBill: (id, updated) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, ...updated } : b,
          ),
        })),
      removeBill: (id) =>
        set((state) => ({ bills: state.bills.filter((b) => b.id !== id) })),
    }),
    { name: 'patientBills' },
  ),
)
