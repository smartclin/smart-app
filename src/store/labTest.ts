import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LabTest {
  id: number
  recordId: number
  testDate: string
  result: string
  status: string
  notes?: string
  serviceId?: number
  createdAt: string
  updatedAt: string
}

interface LabTestStore {
  labTests: LabTest[]
  addLabTest: (test: LabTest) => void
  updateLabTest: (id: number, updated: Partial<LabTest>) => void
  removeLabTest: (id: number) => void
}

export const useLabTestStore = create<LabTestStore>()(
  persist(
    (set) => ({
      labTests: [],
      addLabTest: (test) =>
        set((state) => ({ labTests: [...state.labTests, test] })),
      updateLabTest: (id, updated) =>
        set((state) => ({
          labTests: state.labTests.map((t) =>
            t.id === id ? { ...t, ...updated } : t,
          ),
        })),
      removeLabTest: (id) =>
        set((state) => ({
          labTests: state.labTests.filter((t) => t.id !== id),
        })),
    }),
    { name: 'labTests' },
  ),
)
