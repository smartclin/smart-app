import { Suspense } from 'react'

import { ResetPasswordCard } from '@/components/auth/reset-password'

const ResetPasswordPage = () => {
	return (
		<div className="z-50 flex h-[100vh] w-full flex-col items-center justify-center">
			<Suspense>
				<ResetPasswordCard />
			</Suspense>
		</div>
	)
}

export default ResetPasswordPage
