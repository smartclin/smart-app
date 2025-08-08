// app/components/action-dialog.tsx
import { Trash2 } from 'lucide-react'
import { FaQuestion } from 'react-icons/fa6'

import { DeleteButton } from './delete-button' // New small client component
import { ProfileImage } from './profile-image'
import { SmallCard } from './small-card'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

interface ActionDialogProps {
  type: 'doctor' | 'staff' | 'delete'
  id: string
  data?: {
    img?: string | null
    name?: string | null
    colorCode?: string | null
    role?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    department?: string | null
    licenseNumber?: string | null
  }
  deleteType?: 'doctor' | 'staff' | 'patient' | 'payment' | 'bill'
}

export function ActionDialog({
  id,
  data,
  type,
  deleteType,
}: ActionDialogProps) {
  // Handles the deletion confirmation dialog
  if (type === 'delete') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className='flex items-center justify-center rounded-full text-red-500'
            variant='outline'
          >
            <Trash2
              className='text-red-500'
              size={16}
            />
            {deleteType === 'patient' && 'Delete'}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <div className='flex flex-col items-center justify-center py-6'>
            <DialogTitle>
              <div className='mb-2 rounded-full bg-red-200 p-4'>
                <FaQuestion
                  className='text-red-500'
                  size={50}
                />
              </div>
            </DialogTitle>

            <span className='text-black text-xl'>Delete Confirmation</span>
            <p className='text-sm'>
              Are you sure you want to delete the selected record?
            </p>

            <div className='mt-6 flex items-center justify-center gap-x-3'>
              <DialogClose asChild>
                <Button
                  className='px-4 py-2'
                  variant='outline'
                >
                  Cancel
                </Button>
              </DialogClose>

              <DeleteButton
                deleteType={deleteType}
                id={id}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Handles the staff information dialog
  if (type === 'staff') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className='flex items-center justify-center rounded-full text-blue-600 hover:underline'
            variant='outline'
          >
            View
          </Button>
        </DialogTrigger>

        <DialogContent className='max-h-[90%] max-w-[300px] overflow-y-auto p-8 md:max-w-2xl'>
          <DialogTitle className='mb-4 font-semibold text-gray-600 text-lg'>
            Staff Information
          </DialogTitle>

          <div className='flex justify-between'>
            <div className='flex items-center gap-3'>
              <ProfileImage
                bgColor={data?.colorCode ?? '0000'}
                className='xl:size-20'
                name={data?.name ?? ''}
                textClassName='xl:text-2xl'
                url={data?.img ?? ''}
              />

              <div className='flex flex-col'>
                <p className='font-semibold text-xl'>{data?.name}</p>
                <span className='text-gray-600 text-sm capitalize md:text-base'>
                  {data?.role?.toLowerCase()}
                </span>
                <span className='text-blue-500 text-sm'>Full-Time</span>
              </div>
            </div>
          </div>

          <div className='mt-10 space-y-6'>
            <div className='flex flex-col gap-y-4 md:flex-row md:flex-wrap xl:justify-between'>
              <SmallCard
                label='Email Address'
                value={data?.email ?? 'N/A'}
              />
              <SmallCard
                label='Phone Number'
                value={data?.phone ?? 'N/A'}
              />
            </div>

            <div>
              <SmallCard
                label='Address'
                value={data?.address || 'N/A'}
              />
            </div>

            <div className='flex flex-col gap-y-4 md:flex-row md:flex-wrap xl:justify-between'>
              <SmallCard
                label='Role'
                value={data?.role ?? 'N/A'}
              />
              <SmallCard
                label='Department'
                value={data?.department || 'N/A'}
              />
              <SmallCard
                label='License Number'
                value={data?.licenseNumber || 'N/A'}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Handles the doctor information dialog (placeholder)
  if (type === 'doctor') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className='flex items-center justify-center rounded-full text-green-600 hover:underline'
            variant='outline'
          >
            View
          </Button>
        </DialogTrigger>

        <DialogContent className='max-h-[90%] max-w-[300px] overflow-y-auto p-8 md:max-w-2xl'>
          <DialogTitle className='mb-4 font-semibold text-gray-600 text-lg'>
            Doctor Information
          </DialogTitle>
          <div className='flex justify-between'>
            <div className='flex items-center gap-3'>
              <ProfileImage
                bgColor={data?.colorCode ?? '0000'}
                className='xl:size-20'
                name={data?.name ?? ''}
                textClassName='xl:text-2xl'
                url={data?.img ?? ''}
              />
              <div className='flex flex-col'>
                <p className='font-semibold text-xl'>{data?.name}</p>
                <span className='text-gray-600 text-sm capitalize md:text-base'>
                  {data?.department ?? 'N/A'}
                </span>
                <span className='text-green-500 text-sm'>Doctor</span>
              </div>
            </div>
          </div>
          {/* Add more doctor-specific details here */}
          <div className='mt-10 space-y-6'>
            <div className='flex flex-col gap-y-4 md:flex-row md:flex-wrap xl:justify-between'>
              <SmallCard
                label='Email Address'
                value={data?.email ?? 'N/A'}
              />
              <SmallCard
                label='Phone Number'
                value={data?.phone ?? 'N/A'}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Return null if the type is not recognized
  return null
}
