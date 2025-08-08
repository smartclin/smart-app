import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Rating {
  id: number
  staffId: string
  patientId: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
}

interface RatingStore {
  ratings: Rating[]
  addRating: (rating: Rating) => void
  updateRating: (id: number, updated: Partial<Rating>) => void
  removeRating: (id: number) => void
}

export const useRatingStore = create<RatingStore>()(
  persist(
    (set, get) => ({
      ratings: [],
      addRating: (rating) => set({ ratings: [...get().ratings, rating] }),
      updateRating: (id, updated) =>
        set({
          ratings: get().ratings.map((r) =>
            r.id === id ? { ...r, ...updated } : r,
          ),
        }),
      removeRating: (id) =>
        set({ ratings: get().ratings.filter((r) => r.id !== id) }),
    }),
    { name: 'ratings' },
  ),
)
