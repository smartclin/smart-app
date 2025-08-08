import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Doctor {
  id: string
  email: string
  name: string
  userId: string
  specialization: string
  licenseNumber?: string
  phone?: string
  address?: string
  department?: string
  img?: string
  colorCode?: string
  availabilityStatus?: string
  type: string
  role?: string
  createdAt: Date
  updatedAt: Date
}

interface DoctorStore {
  doctors: Doctor[]
  addDoctor: (doctor: Doctor) => void
  updateDoctor: (id: string, data: Partial<Doctor>) => void
  removeDoctor: (id: string) => void
}

export const useDoctorStore = create<DoctorStore>()(
  persist(
    (set) => ({
      doctors: [],
      addDoctor: (doctor) =>
        set((state) => ({ doctors: [...state.doctors, doctor] })),
      updateDoctor: (id, data) =>
        set((state) => ({
          doctors: state.doctors.map((d) =>
            d.id === id ? { ...d, ...data } : d,
          ),
        })),
      removeDoctor: (id) =>
        set((state) => ({
          doctors: state.doctors.filter((d) => d.id !== id),
        })),
    }),
    { name: 'doctor-store' },
  ),
)
