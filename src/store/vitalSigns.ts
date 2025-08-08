import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface VitalSign {
  id: number
  patientId: string
  medicalId: number
  bodyTemperature?: number
  systolic?: number
  diastolic?: number
  heartRate?: string
  respiratoryRate?: number
  oxygenSaturation?: number
  weight: number
  height?: number
  createdAt: string
  updatedAt: string
}

interface VitalSignsStore {
  vitals: VitalSign[]
  addVital: (vital: VitalSign) => void
  updateVital: (id: number, updated: Partial<VitalSign>) => void
  removeVital: (id: number) => void
}

export const useVitalSignsStore = create<VitalSignsStore>()(
  persist(
    (set) => ({
      vitals: [],
      addVital: (vital) =>
        set((state) => ({ vitals: [...state.vitals, vital] })),
      updateVital: (id, updated) =>
        set((state) => ({
          vitals: state.vitals.map((v) =>
            v.id === id ? { ...v, ...updated } : v,
          ),
        })),
      removeVital: (id) =>
        set((state) => ({ vitals: state.vitals.filter((v) => v.id !== id) })),
    }),
    { name: 'vitalSigns' },
  ),
)
