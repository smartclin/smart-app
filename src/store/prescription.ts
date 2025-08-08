import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Prescription {
  id: number
  medicalRecordId: number
  doctorId?: string
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  issuedDate: string
  endDate?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface PrescriptionStore {
  prescriptions: Prescription[]
  addPrescription: (prescription: Prescription) => void
  updatePrescription: (id: number, updated: Partial<Prescription>) => void
  removePrescription: (id: number) => void
}

export const usePrescriptionStore = create<PrescriptionStore>()(
  persist(
    (set, get) => ({
      prescriptions: [],
      addPrescription: (prescription) =>
        set({ prescriptions: [...get().prescriptions, prescription] }),
      updatePrescription: (id, updated) =>
        set({
          prescriptions: get().prescriptions.map((p) =>
            p.id === id ? { ...p, ...updated } : p,
          ),
        }),
      removePrescription: (id) =>
        set({ prescriptions: get().prescriptions.filter((p) => p.id !== id) }),
    }),
    { name: 'prescriptions' },
  ),
)
