'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { deleteDataAction } from '@/actions/delete-data'

import { Button } from './ui/button'

export function DeleteButton({
  id,
  deleteType,
}: {
  id: string
  deleteType?: 'doctor' | 'staff' | 'patient' | 'payment' | 'bill'
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      className='bg-destructive px-4 py-2 font-medium text-sm text-white hover:bg-destructive hover:text-white'
      disabled={isPending}
      onClick={() => {
        if (!deleteType) {
          toast.error('Delete type is not specified')
          return
        }
        startTransition(async () => {
          const res = await deleteDataAction(id, deleteType)
          if (res?.success) {
            toast.success('Record deleted successfully')
          } else {
            toast.error('Failed to delete record')
          }
        })
      }}
      variant='outline'
    >
      {isPending ? 'Deleting...' : 'Yes. Delete'}
    </Button>
  )
}
