'use server'

import { trpc } from '@/trpc/server'

export async function deleteDataAction(
  id: string,
  deleteType: 'doctor' | 'staff' | 'patient' | 'payment' | 'bill',
) {
  return await trpc.admin.deleteData({ id, deleteType })
}
