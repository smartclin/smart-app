'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { DoctorSchema, type workingDaySchema } from '@/lib/schema'
import { trpc } from '@/trpc/client'
import type { Weekday } from '@/types/data-types'
import { SPECIALIZATION } from '@/utils/seetings'

import { CustomInput, SwitchInput } from '../custom-input'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Label } from '../ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

const TYPES = [
	{ label: 'Full-Time', value: 'FULL' },
	{ label: 'Part-Time', value: 'PART' },
]

const WORKINGDAYS: { label: string; value: Weekday }[] = [
	{ label: 'Sunday', value: 'sunday' },
	{ label: 'Monday', value: 'monday' },
	{ label: 'Tuesday', value: 'tuesday' },
	{ label: 'Wednesday', value: 'wednesday' },
	{ label: 'Thursday', value: 'thursday' },
	{ label: 'Friday', value: 'friday' },
	{ label: 'Saturday', value: 'saturday' },
]

type Day = z.infer<typeof workingDaySchema>

export const DoctorForm = () => {
	const router = useRouter()

	const [workSchedule, setWorkSchedule] = useState<Day[]>([])

	const form = useForm<z.infer<typeof DoctorSchema>>({
		resolver: zodResolver(DoctorSchema),
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			specialization: '',
			address: '',
			type: 'FULL',
			department: '',
			img: '',
			password: '',
			licenseNumber: '',
		},
	})

	const createDoctorMutation = trpc.admin.createNewDoctor.useMutation({
		onSuccess: resp => {
			if (resp.success) {
				toast.success('Doctor added successfully!')
				setWorkSchedule([])
				form.reset()
				router.refresh()
			} else if (resp.error) {
				toast.error(resp.message)
			}
		},
		onError: (error: unknown) => {
			const e = error as Error
			console.error('Error creating doctor:', e)
			toast.error(e.message || 'Something went wrong')
		},
	})

	const { isPending } = createDoctorMutation

	const handleSubmit = async (values: z.infer<typeof DoctorSchema>) => {
		if (workSchedule.length === 0) {
			toast.error('Please select working days')
			return
		}

		try {
			await createDoctorMutation.mutateAsync({
				...values,
				password: values.password ?? '',
				workSchedule,
			})
		} catch (error) {
			console.error('Unhandled error in handleSubmit:', error)
		}
	}

	const selectedSpecialization = form.watch('specialization')
	useEffect(() => {
		if (selectedSpecialization) {
			const department = SPECIALIZATION.find(el => el.value === selectedSpecialization)
			if (department) {
				form.setValue('department', department.department)
			}
		}
	}, [selectedSpecialization, form.setValue])

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<Plus size={20} /> Add Doctor
				</Button>
			</SheetTrigger>

			<SheetContent className="w-full overflow-y-scroll rounded-xl rounded-r-xl md:top-[5%] md:right-[1%] md:h-[90%]">
				<SheetHeader>
					<SheetTitle>Add New Doctor</SheetTitle>
				</SheetHeader>

				<div>
					<Form {...form}>
						<form
							className="mt-5 space-y-8 2xl:mt-10"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<CustomInput
								control={form.control}
								defaultValue="FULL"
								label="Type"
								name="type"
								placeholder=""
								selectList={TYPES}
								type="radio"
							/>

							<CustomInput
								control={form.control}
								label="Full Name"
								name="name"
								placeholder="Doctor's name"
								type="input"
							/>

							<div className="flex items-center gap-2">
								<CustomInput
									control={form.control}
									label="Specialization"
									name="specialization"
									placeholder="Select specialization"
									selectList={SPECIALIZATION}
									type="select"
								/>
								<CustomInput
									control={form.control}
									label="Department"
									name="department"
									placeholder="OPD"
									type="input"
								/>
							</div>

							<CustomInput
								control={form.control}
								inputType="password"
								label="Password"
								name="password"
								placeholder=""
								type="input"
							/>

							<div className="mt-6">
								<Label>Working Days</Label>
								<SwitchInput
									data={WORKINGDAYS} // this should be compatible with Day['day']
									selectedDays={workSchedule}
									setWorkSchedule={setWorkSchedule}
								/>{' '}
							</div>

							<Button
								className="w-full"
								disabled={isPending}
								type="submit"
							>
								Submit
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	)
}
