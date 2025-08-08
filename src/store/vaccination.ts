import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Vaccination {
  id: number
  patientId: string
  administeredBy?: string
  vaccineName: string
  vaccineBatchNo?: string
  administrationRoute?: string
  siteOfInjection?: string
  administeredDate: string
  nextDueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface VaccinationStore {
  vaccinations: Vaccination[]
  addVaccination: (vacc: Vaccination) => void
  updateVaccination: (id: number, updated: Partial<Vaccination>) => void
  removeVaccination: (id: number) => void
}

export const useVaccinationStore = create<VaccinationStore>()(
  persist(
    (set, get) => ({
      vaccinations: [],
      addVaccination: (vacc) =>
        set({ vaccinations: [...get().vaccinations, vacc] }),
      updateVaccination: (id, updated) =>
        set({
          vaccinations: get().vaccinations.map((v) =>
            v.id === id ? { ...v, ...updated } : v,
          ),
        }),
      removeVaccination: (id) =>
        set({ vaccinations: get().vaccinations.filter((v) => v.id !== id) }),
    }),
    { name: 'vaccinations' },
  ),
)
