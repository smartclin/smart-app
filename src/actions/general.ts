'use server'

import db from '@/db'
import { auth } from '@/lib/auth'
import { type ReviewFormValues, reviewSchema } from '@/lib/schema'

export async function deleteDataById(
  id: string,

  deleteType: 'doctor' | 'staff' | 'patient' | 'payment' | 'bill',
) {
  try {
    switch (deleteType) {
      case 'doctor':
        await db.doctor.delete({ where: { id: id } })
        break
      case 'staff':
        await db.staff.delete({ where: { id: id } })
        break
      case 'patient':
        await db.patient.delete({ where: { id: id } })
        break
      case 'payment':
        await db.payment.delete({ where: { id: Number(id) } })
    }

    if (
      deleteType === 'staff' ||
      deleteType === 'patient' ||
      deleteType === 'doctor'
    ) {
      await auth.api.deleteUser({ body: {} })
    }

    return {
      success: true,
      message: 'Data deleted successfully',
      status: 200,
    }
  } catch (_error) {
    return {
      success: false,
      message: 'Internal Server Error',
      status: 500,
    }
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const validatedFields = reviewSchema.parse(values)

    await db.rating.create({
      data: {
        ...validatedFields,
      },
    })

    return {
      success: true,
      message: 'Review created successfully',
      status: 200,
    }
  } catch (_error) {
    return {
      success: false,
      message: 'Internal Server Error',
      status: 500,
    }
  }
}
