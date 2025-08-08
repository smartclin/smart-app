'use client'

import type { User } from 'better-auth'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { authClient } from '@/lib/auth/auth-client'

import { Button } from './ui/button'

export default function DeleteUserButton({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const deleteUser = async () => {
    await authClient.admin.removeUser(
      { userId: user.id },
      {
        onRequest: () => {
          setLoading(true)
        },
        onSuccess: () => {
          setLoading(false)
          toast.success('Conta deletada com sucesso')
          router.refresh()
        },
        onError: () => {
          setLoading(false)
          toast.error('Erro ao deletar conta.')
        },
      },
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className='text-red-500 hover:bg-red-50 hover:text-red-700'
          size='sm'
          variant='ghost'
        >
          <Trash2 className='h-4 w-4' />
          <span className='sr-only'>Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário{' '}
            <span className='font-medium'>{user.name}</span>? Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className='bg-red-500 hover:bg-red-600'
            disabled={loading}
            onClick={deleteUser}
          >
            {loading ? (
              <LoaderCircle
                className='animate-spin'
                size={16}
              />
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
