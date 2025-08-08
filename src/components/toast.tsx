'use client'

import { toast, Zoom } from 'react-toastify'

import { Button } from '@/components/ui/button'

export function Toast() {
  return (
    <Button
      className='cursor-pointer'
      onClick={() =>
        toast('🦄 Wow so easy!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          transition: Zoom,
        })
      }
      variant='outline'
    >
      <span>Click me</span>
    </Button>
  )
}
