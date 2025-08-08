import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Services {
  id: number
  serviceName: string
  description: string
  price: number
  category?: string
  duration?: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface ServicesStore {
  services: Services[]
  addService: (service: Services) => void
  updateService: (id: number, updated: Partial<Services>) => void
  removeService: (id: number) => void
}

export const useServicesStore = create<ServicesStore>()(
  persist(
    (set, get) => ({
      services: [],
      addService: (service) => set({ services: [...get().services, service] }),
      updateService: (id, updated) =>
        set({
          services: get().services.map((s) =>
            s.id === id ? { ...s, ...updated } : s,
          ),
        }),
      removeService: (id) =>
        set({ services: get().services.filter((s) => s.id !== id) }),
    }),
    { name: 'services' },
  ),
)
