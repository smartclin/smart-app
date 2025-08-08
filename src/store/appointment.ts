import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Appointment {
  id: number
  patientId: string
  doctorId: string
  serviceId?: number
  appointmentDate: Date
  time: string
  status?: string
  type: string
  note?: string
  reason?: string
  createdAt: Date
  updatedAt: Date
}

interface AppointmentStore {
  appointments: Appointment[]
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: number, data: Partial<Appointment>) => void
  removeAppointment: (id: number) => void
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set) => ({
      appointments: [],
      addAppointment: (appointment) =>
        set((state) => ({
          appointments: [...state.appointments, appointment],
        })),
      updateAppointment: (id, data) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...data } : a,
          ),
        })),
      removeAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
        })),
    }),
    { name: 'appointment-store' },
  ),
)
