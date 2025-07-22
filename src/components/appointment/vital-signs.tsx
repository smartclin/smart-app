import { format } from 'date-fns'

import { getSession } from '@/lib/auth'
import db from '@/lib/db'
import { calculateBMI } from '@/utils'
import { checkRole } from '@/utils/roles'

import { AddVitalSigns } from '../dialogs/add-vital-signs'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'

interface VitalSignsProps {
	id: number
	patientId: string
	doctorId: string
	medicalId?: number
	appointmentId?: number
}

const ItemCard = ({ label, value }: { label: string; value: string }) => {
	return (
		<div className="w-full">
			<p className="font-medium text-lg xl:text-xl">{value}</p>
			<p className="text-gray-500 text-sm xl:text-base">{label}</p>
		</div>
	)
}
export const VitalSigns = async ({ id, patientId, doctorId }: VitalSignsProps) => {
	const data = await db.medicalRecords.findFirst({
		where: { appointmentId: Number(id) },
		include: {
			vitalSigns: {
				orderBy: { createdAt: 'desc' },
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	const vitals = data?.vitalSigns || null
	const session = await getSession()
	const isPatient = await checkRole(session, 'PATIENT')

	return (
		<section id="vital-signs">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Vital Signs</CardTitle>

					{!isPatient && (
						<AddVitalSigns
							appointmentId={id ?? 1}
							doctorId={doctorId}
							key={Date.now()}
							medicalId={data ? data?.id : 1}
							patientId={patientId}
						/>
					)}
				</CardHeader>

				<CardContent className="space-y-4">
					{vitals?.map(el => {
						const { bmi, status, colorCode } = calculateBMI(el.weight || 0, el.height || 0)

						return (
							<div
								className="space-y-4"
								key={el?.id}
							>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									<ItemCard
										label="Body Temperature"
										value={`${el?.bodyTemperature}°C`}
									/>
									<ItemCard
										label="Blood Pressure"
										value={`${el?.systolic} / ${el?.diastolic} mmHg`}
									/>
									<ItemCard
										label="Heart Rate"
										value={`${el?.heartRate} bpm`}
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									<ItemCard
										label="Weight"
										value={`${el?.weight} kg`}
									/>
									<ItemCard
										label="Height"
										value={`${el?.height} cm`}
									/>

									<div className="w-full">
										<div className="flex items-center gap-x-2">
											<p className="font-medium text-lg xl:text-xl">{bmi}</p>
											<span
												className="font-medium text-sm"
												style={{ color: colorCode }}
											>
												({status})
											</span>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									<ItemCard
										label="Respiratory Rate"
										value={`${el?.respiratoryRate || 'N/A'}`}
									/>
									<ItemCard
										label="Oxygen Saturation"
										value={`${el?.oxygenSaturation || 'n/a'}`}
									/>
									<ItemCard
										label="Reading Date"
										value={format(el?.createdAt, 'MMM d, yyyy hh:mm a')}
									/>
								</div>
								<Separator className="mt-4" />
							</div>
						)
					})}
				</CardContent>
			</Card>
		</section>
	)
}
