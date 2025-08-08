'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Patient } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { type AuthUser, useUser } from '@/hooks/use-auth'
import { GENDER, MARITAL_STATUS, NUTRITIONAL_STATUS, RELATION } from '@/lib'
import { PatientFormSchema } from '@/lib/schema'
import { trpc } from '@/trpc/client' // Correct tRPC client import

import { CustomInput } from './custom-input'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Form } from './ui/form'

type PatientFormValues = z.infer<typeof PatientFormSchema>

interface DataProps {
  data?: Patient
  type: 'create' | 'update'
}

const defaultValues: PatientFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: new Date(),
  gender: 'MALE',
  maritalStatus: 'single',
  nutritionalStatus: 'normal',
  emergencyContactName: '',
  emergencyContactNumber: '',
  relation: 'mother',
  bloodGroup: '',
  allergies: '',
  medicalConditions: '',
  insuranceNumber: '',
  insuranceProvider: '',
  medicalHistory: '',
  medicalConsent: false,
  privacyConsent: false,
  serviceConsent: false,
}

export const NewPatient = ({ data, type }: DataProps) => {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const [loading, setLoading] = useState(false)

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientFormSchema) as Resolver<PatientFormValues>,
    defaultValues,
    mode: 'onBlur',
  })

  // --- tRPC Mutations ---
  // Create patient mutation
  const createPatientMutation = trpc.patient.createNewPatient.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.msg)
        form.reset()
        router.push('/patient')
      } else {
        toast.error(res.msg || 'Patient creation failed.')
      }
    },
    onError: (error) => {
      console.error('Error creating patient:', error)
      toast.error(
        error.message || 'An unexpected error occurred during creation.',
      )
    },
    onMutate: () => {
      setLoading(true)
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const updatePatientMutation = trpc.patient.updatePatient.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.msg)
        router.push('/patient')
      } else {
        toast.error(res.msg || 'Patient update failed.')
      }
    },
    onError: (error) => {
      console.error('Error updating patient:', error)
      toast.error(
        error.message || 'An unexpected error occurred during update.',
      )
    },
    onMutate: () => {
      setLoading(true)
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const getCreateDefaultValues = useCallback(
    (user: AuthUser): PatientFormValues => {
      return {
        ...defaultValues,
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
      }
    },
    [],
  )

  const getPersonalInfo = useCallback((data: Patient) => {
    return {
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
      gender: data.gender,
      maritalStatus: data.maritalStatus as PatientFormValues['maritalStatus'],
      nutritionalStatus:
        data.nutritionalStatus as PatientFormValues['nutritionalStatus'],
      address: data.address ?? '',
    }
  }, [])

  const getFamilyInfo = useCallback((data: Patient) => {
    return {
      emergencyContactName: data.emergencyContactName ?? '',
      emergencyContactNumber: data.emergencyContactNumber ?? '',
      relation: data.relation as PatientFormValues['relation'],
    }
  }, [])

  const getMedicalInfo = useCallback((data: Patient) => {
    return {
      bloodGroup: data.bloodGroup ?? '',
      allergies: data.allergies ?? '',
      medicalConditions: data.medicalConditions ?? '',
      insuranceNumber: data.insuranceNumber ?? '',
      insuranceProvider: data.insuranceProvider ?? '',
      medicalHistory: data.medicalHistory ?? '',
    }
  }, [])

  const getConsentInfo = useCallback((data: Patient) => {
    return {
      medicalConsent: data.medicalConsent ?? false,
      privacyConsent: data.privacyConsent ?? false,
      serviceConsent: data.serviceConsent ?? false,
    }
  }, [])

  const getUpdateDefaultValues = useCallback(
    (data: Patient): PatientFormValues => {
      return {
        ...getPersonalInfo(data),
        ...getFamilyInfo(data),
        ...getMedicalInfo(data),
        ...getConsentInfo(data),
      }
    },
    [getPersonalInfo, getFamilyInfo, getMedicalInfo, getConsentInfo],
  )

  useEffect(() => {
    if (isUserLoading) return

    if (type === 'create') {
      if (user) {
        form.reset(getCreateDefaultValues(user))
      }
    } else if (type === 'update' && data) {
      form.reset(getUpdateDefaultValues(data))
    }
  }, [
    isUserLoading,
    user,
    data,
    type,
    form,
    getCreateDefaultValues,
    getUpdateDefaultValues,
  ])

  const onSubmit = async (values: PatientFormValues) => {
    const userId = user?.id

    if (!userId) {
      toast.error('User not authenticated.')
      return
    }

    try {
      if (type === 'create') {
        // Pass the form values and userId.
        // Your server-side `createNewPatient` procedure should expect:
        // z.object({...PatientFormSchema, userId: z.string()})
        await createPatientMutation.mutateAsync({
          pid: data?.id ?? '', // The patient ID
          data: values,
        })
      } else {
        // type === 'update'
        if (!data?.id) {
          toast.error('Patient ID is missing for update.')
          return
        }
        // The error message indicates 'userId' is not a top-level property
        // for `updatePatient`, and it expects a `data` object for the patient details.
        // So, we'll pass the patient details under a 'data' key.
        // Your server-side `updatePatient` procedure should expect:
        // z.object({ pid: z.string(), data: PatientFormSchema })
        // The `userId` is likely being pulled from the session/context on the server.
        await updatePatientMutation.mutateAsync({
          pid: data.id, // The patient ID
          data: values, // All the form values under a 'data' key
        })
      }
    } catch (error) {
      console.error('Submission error:', error)
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      toast.error(message)
    }
  }

  if (isUserLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='ml-2 text-muted-foreground'>
          Loading user information...
        </p>
      </div>
    )
  }

  return (
    <Card className='w-full max-w-6xl p-4'>
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>
        <CardDescription>
          Please provide all the information below to help us understand better
          and provide good and quality service to you.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            className='mt-5 space-y-8'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Personal Info */}
            <h3 className='font-semibold text-lg'>Personal Information</h3>
            <div className='flex flex-col items-center gap-6 md:flex-row md:gap-4'>
              <CustomInput
                control={form.control}
                label='First Name'
                name='firstName'
                placeholder='John'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Last Name'
                name='lastName'
                placeholder='Doe'
                type='input'
              />
            </div>
            <CustomInput
              control={form.control}
              label='Email Address'
              name='email'
              placeholder='john@example.com'
              type='input'
            />
            <div className='flex flex-col items-center gap-6 md:flex-row md:gap-4'>
              <CustomInput
                control={form.control}
                label='Gender'
                name='gender'
                placeholder='Select gender'
                selectList={GENDER}
                type='select'
              />
              <CustomInput
                control={form.control}
                inputType='date'
                label='Date of Birth'
                name='dateOfBirth'
                placeholder='YYYY-MM-DD'
                type='input'
              />
            </div>
            <div className='flex flex-col items-center gap-6 md:flex-row md:gap-4'>
              <CustomInput
                control={form.control}
                label='Contact Number'
                name='phone'
                placeholder='9225600735'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Marital Status'
                name='maritalStatus'
                placeholder='Select marital status'
                selectList={MARITAL_STATUS}
                type='select'
              />

              <CustomInput
                control={form.control}
                label='Nutritional Status'
                name='nutritionalStatus'
                placeholder='Select marital status'
                selectList={NUTRITIONAL_STATUS}
                type='select'
              />
            </div>
            <CustomInput
              control={form.control}
              label='Address'
              name='address'
              placeholder='1479 Street, Apt 1839-G, NY'
              type='input'
            />

            {/* Family Info */}
            <div className='space-y-8'>
              <h3 className='font-semibold text-lg'>Family Information</h3>
              <CustomInput
                control={form.control}
                label='Emergency contact name'
                name='emergencyContactName'
                placeholder='Anne Smith'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Emergency contact'
                name='emergencyContactNumber'
                placeholder='675444467'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Relation'
                name='relation'
                placeholder='Select relation'
                selectList={RELATION}
                type='select'
              />
            </div>

            {/* Medical Info */}
            <div className='space-y-8'>
              <h3 className='font-semibold text-lg'>Medical Information</h3>
              <CustomInput
                control={form.control}
                label='Blood group'
                name='bloodGroup'
                placeholder='A+'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Allergies'
                name='allergies'
                placeholder='Milk'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Medical conditions'
                name='medicalConditions'
                placeholder='Medical conditions'
                type='input'
              />
              <CustomInput
                control={form.control}
                label='Medical history'
                name='medicalHistory'
                placeholder='Medical history'
                type='input'
              />
              <div className='flex flex-col items-center gap-6 md:flex-row md:gap-4'>
                <CustomInput
                  control={form.control}
                  label='Insurance provider'
                  name='insuranceProvider'
                  placeholder='Provider'
                  type='input'
                />
                <CustomInput
                  control={form.control}
                  label='Insurance number'
                  name='insuranceNumber'
                  placeholder='1234567890'
                  type='input'
                />
              </div>
            </div>

            {/* Consent (only on creation) */}
            {type !== 'update' && (
              <div>
                <h3 className='mb-2 font-semibold text-lg'>Consent</h3>
                <div className='space-y-6'>
                  <CustomInput
                    control={form.control}
                    label='Privacy Policy Agreement'
                    name='privacyConsent'
                    placeholder='I consent to the collection...'
                    type='checkbox'
                  />
                  <CustomInput
                    control={form.control}
                    label='Terms of Service Agreement'
                    name='serviceConsent'
                    placeholder='I agree to the Terms...'
                    type='checkbox'
                  />
                  <CustomInput
                    control={form.control}
                    label='Informed Medical Consent'
                    name='medicalConsent'
                    placeholder='I provide informed consent...'
                    type='checkbox'
                  />
                </div>
              </div>
            )}

            <Button
              className='w-full px-6 md:w-fit'
              disabled={loading}
              type='submit'
            >
              {loading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : type === 'create' ? (
                'Submit'
              ) : (
                'Update'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
