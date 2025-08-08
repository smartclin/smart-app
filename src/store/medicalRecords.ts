import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MedicalRecord {
  id: number
  patientId: string
  appointmentId: number
  doctorId: string
  treatmentPlan?: string
  prescriptions?: string
  labRequest?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface MedicalRecordsStore {
  records: MedicalRecord[]
  addRecord: (record: MedicalRecord) => void
  updateRecord: (id: number, updated: Partial<MedicalRecord>) => void
  removeRecord: (id: number) => void
}

export const useMedicalRecordsStore = create<MedicalRecordsStore>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({ records: [...state.records, record] })),
      updateRecord: (id, updated) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updated } : r,
          ),
        })),
      removeRecord: (id) =>
        set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
    }),
    { name: 'medicalRecords' },
  ),
)
