import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Diagnosis {
  id: number
  patientId: string
  medicalId: number
  doctorId: string
  symptoms: string
  diagnosis: string
  notes?: string
  prescribedMedications?: string
  followUpPlan?: string
  createdAt: string
  updatedAt: string
}

interface DiagnosisStore {
  diagnoses: Diagnosis[]
  addDiagnosis: (diag: Diagnosis) => void
  updateDiagnosis: (id: number, updated: Partial<Diagnosis>) => void
  removeDiagnosis: (id: number) => void
}

export const useDiagnosisStore = create<DiagnosisStore>()(
  persist(
    (set) => ({
      diagnoses: [],
      addDiagnosis: (diag) =>
        set((state) => ({ diagnoses: [...state.diagnoses, diag] })),
      updateDiagnosis: (id, updated) =>
        set((state) => ({
          diagnoses: state.diagnoses.map((d) =>
            d.id === id ? { ...d, ...updated } : d,
          ),
        })),
      removeDiagnosis: (id) =>
        set((state) => ({
          diagnoses: state.diagnoses.filter((d) => d.id !== id),
        })),
    }),
    { name: 'diagnoses' },
  ),
)
