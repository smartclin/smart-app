'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { PaymentSchema } from '@/lib/schema'
import { trpc } from '@/trpc/client'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import { CardHeader } from '../ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form } from '../ui/form'

const schema = PaymentSchema.pick({ discount: true, billDate: true }).extend({
  totalAmount: z.number(),
  id: z.number().optional(),
})

type GenerateBillInput = z.infer<typeof schema>

interface DataProps {
  id?: number
  totalBill: number
}

export const GenerateFinalBills = ({ id, totalBill }: DataProps) => {
  const router = useRouter()

  const form = useForm<GenerateBillInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      discount: 0,
      billDate: new Date() ?? '00/00/0000',
      totalAmount: totalBill,
      id: id ?? undefined,
    },
  })

  const { control, handleSubmit } = form

  const generateBill = trpc.payment.generateBill.useMutation({
    onSuccess: () => {
      toast.success('Patient bill generated successfully!')
      router.refresh()
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong')
    },
  })

  const handleOnSubmit: SubmitHandler<GenerateBillInput> = (values) => {
    generateBill.mutate({
      ...values,
      id: id ?? 1,
      totalAmount: totalBill,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='font-normal text-sm'
          size='sm'
          variant='outline'
        >
          <Plus
            className='text-gray-400'
            size={22}
          />
          Generate Final Bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CardHeader className='px-0'>
          <DialogTitle>Patient Medical Bill</DialogTitle>
        </CardHeader>

        <Form {...form}>
          <form
            className='space-y-8'
            onSubmit={handleSubmit(handleOnSubmit)}
          >
            <div className='flex items-center gap-2'>
              <div>
                <span>Total Bill</span>
                <p className='font-semibold text-3xl'>{totalBill.toFixed(2)}</p>
              </div>
            </div>

            <CustomInput
              control={control}
              label='Discount (%)'
              name='discount'
              placeholder='eg.: 5'
              type='input'
            />

            <CustomInput
              control={control}
              inputType='date'
              label='Bill Date'
              name='billDate'
              placeholder=''
              type='input'
            />

            <Button
              className='w-full bg-blue-600'
              disabled={generateBill.status === 'pending'}
              type='submit'
            >
              Generate Bill
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
