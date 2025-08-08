'use server';

// Import Prisma's Payment type. Ensure this path is correct for your project.
import type { Payment as PaymentPrismaType } from '@prisma/client';
import type { z } from 'zod';

import db from '@/db';
import { getSession } from '@/lib/auth';
import {
  AddNewBillInputSchema,
  type DiagnosisFormData,
  DiagnosisSchema,
  type PaymentSchema
} from '@/lib/schema';
import { checkRole } from '@/utils/roles';

// Define an Input Schema for addNewBill that includes necessary IDs

export const addDiagnosis = async (data: DiagnosisFormData, appointmentId: string) => {
  try {
    const validatedData = DiagnosisSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medicalId) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patientId: validatedData.patientId,
          doctorId: validatedData.doctorId,
          appointmentId: Number(appointmentId)
        }
      });
    }

    const medId = validatedData.medicalId || medicalRecord?.id;

    if (typeof medId !== 'number') {
      throw new Error('Medical Record ID is invalid or missing.');
    }

    await db.diagnosis.create({
      data: {
        ...validatedData,
        medicalId: medId
      }
    });

    return {
      success: true,
      message: 'Diagnosis added successfully',
      status: 201
    };
  } catch (error: unknown) {
    console.error('Error adding diagnosis:', error);

    let errorMessage = 'Failed to add diagnosis';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return {
      success: false,
      error: errorMessage,
      status: 500
    };
  }
};

export async function addNewBill(data: z.infer<typeof AddNewBillInputSchema>) {
  try {
    const session = await getSession();
    const isAdmin = await checkRole(session, 'ADMIN');
    const isDoctor = await checkRole(session, 'DOCTOR');

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: 'You are not authorized to add a bill'
      };
    }

    const isValidData = AddNewBillInputSchema.safeParse(data);

    if (!isValidData.success) {
      return {
        success: false,
        msg: 'Invalid bill data provided',
        errors: isValidData.error.flatten()
      };
    }

    const validatedData = isValidData.data;
    // FIX: Allow billInfo to be undefined in addition to PaymentPrismaType or null
    let billInfo: PaymentPrismaType | null | undefined = null;

    if (validatedData.billId === undefined || validatedData.billId === null) {
      const info = await db.appointment.findUnique({
        where: { id: validatedData.appointmentId },
        select: {
          id: true,
          patientId: true,
          bills: {
            where: {
              appointmentId: validatedData.appointmentId
            }
          }
        }
      });

      if (!info) {
        return { success: false, msg: 'Appointment not found for billing.' };
      }

      if (info.patientId === null) {
        return { success: false, msg: 'Patient ID missing for appointment.' };
      }

      if (!info.bills || info.bills.length === 0) {
        billInfo = await db.payment.create({
          data: {
            appointmentId: info.id,
            patientId: info.patientId,
            billDate: new Date(),
            paymentDate: new Date(),
            discount: 0.0,
            amountPaid: 0.0,
            totalAmount: 0.0
          }
        });
      } else {
        billInfo = info.bills[0];
      }
    } else {
      billInfo = await db.payment.findUnique({
        where: { id: validatedData.billId }
      });
      // It's crucial to check if billInfo is found here.
      // If findUnique returns null/undefined, the subsequent access to billInfo.id would fail.
      if (!billInfo) {
        return { success: false, msg: 'Existing bill not found with provided ID.' };
      }
    }

    // This check now correctly handles null and undefined.
    if (!billInfo) {
      return {
        success: false,
        msg: 'Bill information could not be determined for patient bill creation.'
      };
    }

    await db.patientBills.create({
      data: {
        billId: billInfo.id,
        serviceId: Number(validatedData.serviceId),
        serviceDate: new Date(validatedData.serviceDate),
        quantity: Number(validatedData.quantity),
        unitCost: Number(validatedData.unitCost),
        totalCost: Number(validatedData.totalCost)
      }
    });

    return {
      success: true,
      error: false,
      msg: 'Bill added successfully'
    };
  } catch (error: unknown) {
    console.error('Error adding new bill:', error);

    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return { success: false, msg: errorMessage };
  }
}

export async function generateBill(data: z.infer<typeof PaymentSchema>) {
  // <--- THIS IS THE CRUCIAL CHANGE
  try {
    // FIX: Remove the redundant validation here.
    // The data passed to this action is already validated by tRPC's .input(PaymentSchema).
    // const isValidData = PaymentSchema.safeParse(data);
    // if (!isValidData.success) {
    //     return {
    //         success: false,
    //         msg: 'Invalid payment data provided',
    //         errors: isValidData.error.flatten(),
    //     };
    // }
    // const validatedData = isValidData.data; // Now 'data' is already the validated object

    // Use 'data' directly, it's already properly typed as z.infer<typeof PaymentSchema>
    // Ensure that PaymentSchema defines 'discount', 'totalAmount', 'id' as numbers or coerces them
    // if Prisma expects numbers.
    if (
      data.discount === undefined || // These checks are now on properties of the parsed data
      data.totalAmount === undefined ||
      data.id === undefined ||
      data.billDate === undefined
    ) {
      return { success: false, msg: 'Missing required payment data for bill generation.' };
    }

    const discountAmount = (Number(data.discount) / 100) * Number(data.totalAmount); // Use 'data' directly

    const res = await db.payment.update({
      data: {
        billDate: data.billDate,
        discount: discountAmount,
        totalAmount: Number(data.totalAmount)
      },
      where: { id: Number(data.id) } // Cast to number if Prisma expects number ID
    });

    await db.appointment.update({
      data: {
        status: 'COMPLETED'
      },
      where: { id: res.appointmentId }
    });
    return {
      success: true,
      error: false,
      msg: 'Bill generated successfully'
    };
  } catch (error: unknown) {
    console.error('Error generating bill:', error);

    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return { success: false, msg: errorMessage };
  }
}
