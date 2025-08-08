import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Patient {
  id: string
  firstName: string
  lastName: string
  userId: string
  dateOfBirth: Date
  gender: string
  phone?: string
  email: string
  maritalStatus?: string
  nutritionalStatus?: string
  address?: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  relation?: string
  bloodGroup?: string
  allergies?: string
  medicalConditions?: string
  medicalHistory?: string
  insuranceProvider?: string
  insuranceNumber?: string
  privacyConsent?: boolean
  serviceConsent?: boolean
  medicalConsent?: boolean
  img?: string
  colorCode?: string
  role?: string
  createdAt: Date
  updatedAt: Date
}

interface PatientStore {
  patients: Patient[]
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, data: Partial<Patient>) => void
  removePatient: (id: string) => void
}

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      patients: [],
      addPatient: (patient) =>
        set((state) => ({ patients: [...state.patients, patient] })),
      updatePatient: (id, data) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        })),
      removePatient: (id) =>
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
        })),
    }),
    { name: 'patient-store' },
  ),
)
