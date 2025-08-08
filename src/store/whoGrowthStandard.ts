import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WHOGrowthStandard {
  id: number
  ageInMonths: number
  gender: string
  measurementType: string
  lValue: number
  mValue: number
  sValue: number
  sd0: number
  sd1neg: number
  sd1pos: number
  sd2neg: number
  sd2pos: number
  sd3neg: number
  sd3pos: number
  sd4neg?: number
  sd4pos?: number
  createdAt: string
  updatedAt: string
}

interface WHOGrowthStandardStore {
  growthStandards: WHOGrowthStandard[]
  addStandard: (standard: WHOGrowthStandard) => void
  updateStandard: (id: number, updated: Partial<WHOGrowthStandard>) => void
  removeStandard: (id: number) => void
}

export const useWHOGrowthStandardStore = create<WHOGrowthStandardStore>()(
  persist(
    (set, get) => ({
      growthStandards: [],
      addStandard: (standard) =>
        set({ growthStandards: [...get().growthStandards, standard] }),
      updateStandard: (id, updated) =>
        set({
          growthStandards: get().growthStandards.map((s) =>
            s.id === id ? { ...s, ...updated } : s,
          ),
        }),
      removeStandard: (id) =>
        set({
          growthStandards: get().growthStandards.filter((s) => s.id !== id),
        }),
    }),
    { name: 'whoGrowthStandards' },
  ),
)
