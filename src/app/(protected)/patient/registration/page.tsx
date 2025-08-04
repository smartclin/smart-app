import { NewPatient } from '@/components/new-patient'
import { getSession } from '@/lib/auth'
import { trpc } from '@/trpc/server'

const Registration = async () => {
	const session = await getSession()
	const userId = session?.user.id
	const data = await trpc.patient.getPatientById(userId ?? 'N/A')

	return (
		<div className="flex h-full w-full justify-center">
			<div className="relative w-full max-w-6xl pb-10">
				<NewPatient
					data={data || undefined}
					type={!data ? 'create' : 'update'}
				/>
			</div>
		</div>
	)
}

export default Registration
