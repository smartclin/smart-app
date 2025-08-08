'use client'

import { Loader2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'

import ResponsiveModal from './ResponsiveModal'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  chatId: string
}

const DeleteChatModal = ({ open, onOpenChange, onCancel, chatId }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const utils = trpc.useUtils()

  const deleteChat = trpc.chats.deleteOne.useMutation({
    onSuccess: () => {
      onCancel()
      toast.success('Chat Deleted')
      utils.chats.getMany.invalidate()
      if (pathname === `/chat/${chatId}`) {
        router.push('/')
      }
    },
    onError: (error) => {
      toast.error('Failed to delete chat', {
        description: error.message || 'Something went wrong. Please try again.',
      })
    },
  })

  return (
    <ResponsiveModal
      onOpenChange={onOpenChange}
      open={open}
      title='Delete Chat'
    >
      <div className='mx-auto flex max-w-lg flex-col gap-4 py-5 max-md:px-4'>
        Are you sure you want to delete this chat? This action is permanent and
        cannot be undone.
        <div className='items-centers flex flex-col gap-2 md:flex-row md:justify-end'>
          <Button
            className='w-full md:w-fit'
            onClick={onCancel}
            variant='secondary'
          >
            Cancel
          </Button>
          <Button
            className='transition-all sm:w-20'
            disabled={deleteChat.isPending}
            onClick={() => deleteChat.mutate({ chatId })}
            variant='destructive'
          >
            {deleteChat.isPending ? (
              <Loader2 className='size-4 animate-spin transition' />
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default DeleteChatModal
