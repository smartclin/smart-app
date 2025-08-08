'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { DiagnosisSchema } from '@/lib/schema'
import { trpc } from '@/trpc/client'

import { CustomInput } from '../custom-input'
import { Button } from '../ui/button'
import { CardDescription, CardHeader } from '../ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form } from '../ui/form'

interface AddDiagnosisProps {
  patientId: string
  doctorId: string
  medicalId: number

  appointmentId: string | number
}

export type DiagnosisFormData = z.infer<typeof DiagnosisSchema>

export const AddDiagnosis = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
}: AddDiagnosisProps) => {
  const router = useRouter()

  const form = useForm<DiagnosisFormData>({
    resolver: zodResolver(DiagnosisSchema),
    defaultValues: {
      patientId,
      doctorId,
      medicalId,
      symptoms: '',
      diagnosis: '',
      notes: '',
      prescribedMedications: '',
      followUpPlan: '',
    },
  })

  const addDiagnosis = trpc.payment.addDiagnosis.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      form.reset()
      router.refresh()
    },
    onError: (error) => {
      console.error(error)
      toast.error(error.message || 'Failed to add diagnosis')
    },
  })

  const onSubmit = (values: DiagnosisFormData) => {
    addDiagnosis.mutate({
      ...values,
      appointmentId: String(appointmentId),
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='mt-4 bg-blue-600 text-white'
          size='lg'
          variant='outline'
        >
          <Plus
            className='mr-2 text-white'
            size={22}
          />
          Add Diagnosis
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[60%] 2xl:max-w-[40%]'>
        <CardHeader className='px-0'>
          <DialogTitle>Add New Diagnosis</DialogTitle>
          <CardDescription>
            Ensure accurate findings are submitted and well-documented for
            future reference.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <CustomInput
              control={form.control}
              label='Symptoms'
              name='symptoms'
              placeholder='Enter symptoms here...'
              type='textarea'
            />

            <CustomInput
              control={form.control}
              label='Diagnosis (Findings)'
              name='diagnosis'
              placeholder='Enter diagnosis here...'
              type='textarea'
            />

            <CustomInput
              control={form.control}
              label='Prescriptions for this patient'
              name='prescribedMedications'
              placeholder='Enter medications...'
              type='textarea'
            />

            <div className='flex items-center gap-4'>
              <CustomInput
                control={form.control}
                label='Additional Notes'
                name='notes'
                placeholder='Optional note'
                type='textarea'
              />
              <CustomInput
                control={form.control}
                label='Follow Up Plan'
                name='followUpPlan'
                placeholder='Optional'
                type='textarea'
              />
            </div>

            <Button
              className='w-full bg-blue-600'
              disabled={addDiagnosis.isPending}
              type='submit'
            >
              {addDiagnosis.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
