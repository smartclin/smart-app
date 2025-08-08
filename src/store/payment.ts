import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Payment {
  id: number
  billId?: number
  patientId: string
  appointmentId: number
  billDate: string
  paymentDate: string
  discount: number
  totalAmount: number
  amountPaid: number
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER'
  status: 'PAID' | 'UNPAID'
  receiptNumber: number
  createdAt: string
  updatedAt: string
}

interface PaymentStore {
  payments: Payment[]
  addPayment: (payment: Payment) => void
  updatePayment: (id: number, updated: Partial<Payment>) => void
  removePayment: (id: number) => void
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      payments: [],
      addPayment: (payment) =>
        set((state) => ({ payments: [...state.payments, payment] })),
      updatePayment: (id, updated) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, ...updated } : p,
          ),
        })),
      removePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),
    }),
    { name: 'payments' },
  ),
)
