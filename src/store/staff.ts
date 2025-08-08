import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Staff {
  id: string
  email: string
  name: string
  phone: string
  userId: string
  address: string
  department?: string
  img?: string
  licenseNumber?: string
  colorCode?: string
  hireDate?: Date
  salary?: number
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
}

interface StaffStore {
  staff: Staff[]
  addStaff: (staff: Staff) => void
  updateStaff: (id: string, data: Partial<Staff>) => void
  removeStaff: (id: string) => void
}

export const useStaffStore = create<StaffStore>()(
  persist(
    (set) => ({
      staff: [],
      addStaff: (staff) => set((state) => ({ staff: [...state.staff, staff] })),
      updateStaff: (id, data) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      removeStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),
    }),
    { name: 'staff-store' },
  ),
)
