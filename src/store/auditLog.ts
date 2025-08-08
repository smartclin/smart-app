import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuditLog {
  id: number
  userId: string
  recordId: string
  action: string
  details?: string
  model: string
  createdAt: string
  updatedAt: string
}

interface AuditLogStore {
  auditLogs: AuditLog[]
  addAuditLog: (log: AuditLog) => void
  updateAuditLog: (id: number, updated: Partial<AuditLog>) => void
  removeAuditLog: (id: number) => void
}

export const useAuditLogStore = create<AuditLogStore>()(
  persist(
    (set, get) => ({
      auditLogs: [],
      addAuditLog: (log) => set({ auditLogs: [...get().auditLogs, log] }),
      updateAuditLog: (id, updated) =>
        set({
          auditLogs: get().auditLogs.map((log) =>
            log.id === id ? { ...log, ...updated } : log,
          ),
        }),
      removeAuditLog: (id) =>
        set({ auditLogs: get().auditLogs.filter((log) => log.id !== id) }),
    }),
    { name: 'auditLogs' },
  ),
)
