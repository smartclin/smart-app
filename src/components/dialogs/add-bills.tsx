'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Services } from '@prisma/client'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { PatientBillSchema } from '@/lib/schema'
import { trpc } from '@/trpc/client'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import { CardDescription, CardHeader } from '../ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form } from '../ui/form'

interface DataProps {
  id?: number
  appId?: number
  servicesData: Services[]
}

export const AddBills = ({ id, appId, servicesData }: DataProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<{ value: string; label: string }[]>([]) // ✅ FIXED type

  const addNewBill = trpc.payment.addNewBill.useMutation()

  const form = useForm<z.infer<typeof PatientBillSchema>>({
    resolver: zodResolver(PatientBillSchema),
    defaultValues: {
      billId: id,
      serviceId: undefined,
      serviceDate: new Date().toDateString(),
      appointmentId: Number(appId),
      quantity: undefined,
      unitCost: undefined,
      totalCost: undefined,
    },
  })

  const handleOnSubmit = async (values: z.infer<typeof PatientBillSchema>) => {
    try {
      setIsLoading(true)
      const resp = await addNewBill.mutateAsync(values)
      if (resp.success) {
        toast.success('Patient bill added successfully!')
        router.refresh()
        form.reset()
      } else {
        toast.error(resp.msg || 'Error occurred while saving bill.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Update select options from services
  useEffect(() => {
    if (servicesData) {
      const formatted = servicesData.map((service) => ({
        value: service.id.toString(),
        label: service.serviceName,
      }))
      setData(formatted)
    }
  }, [servicesData])

  const selectedService = form.watch('serviceId')
  const quantity = form.watch('quantity')

  // ✅ Auto-calculate unitCost and totalCost
  useEffect(() => {
    if (!selectedService) return

    const matched = servicesData.find((s) => s.id === Number(selectedService))
    if (matched) {
      form.setValue('unitCost', (matched.price ?? 0).toFixed(2))
      if (quantity) {
        form.setValue(
          'totalCost',
          (matched.price * Number(quantity)).toFixed(2),
        )
      }
    }
  }, [selectedService, quantity, form, servicesData])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='font-normal text-sm'
          size='sm'
        >
          <Plus
            className='text-gray-400'
            size={22}
          />
          Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CardHeader className='px-0'>
          <DialogTitle>Add Patient Bill</DialogTitle>
          <CardDescription>
            Ensure accurate readings are performed, as this may affect diagnosis
            and other medical processes.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            className='space-y-8'
            onSubmit={form.handleSubmit(handleOnSubmit)}
          >
            <div className='flex items-center gap-2'>
              <CustomInput
                control={form.control}
                label='Service Name'
                name='serviceId'
                placeholder='Select service'
                selectList={data} // ✅ FIXED fallback
                type='select'
              />
              <CustomInput
                control={form.control}
                label='Unit Cost'
                name='unitCost'
                placeholder=''
                type='input'
              />
            </div>

            <div className='flex items-center gap-2'>
              <CustomInput
                control={form.control}
                label='Quantity'
                name='quantity'
                placeholder='Enter quantity'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Total Cost'
                name='totalCost'
                placeholder='0.00'
                type='input'
              />
            </div>

            <CustomInput
              control={form.control}
              inputType='date'
              label='Service Date'
              name='serviceDate'
              placeholder=''
              type='input'
            />

            <Button
              className='w-full bg-blue-600'
              disabled={isLoading}
              type='submit'
            >
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
