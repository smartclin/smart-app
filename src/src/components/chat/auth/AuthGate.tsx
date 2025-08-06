'use client'

import { useEffect, useState } from 'react'

import { authClient } from '@/lib/auth/auth-client'

const AuthGate = ({ children }: { children: React.ReactNode }) => {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		let cancelled = false

		const init = async () => {
			const session = await authClient.getSession()

			if (!cancelled) {
				if (!session.data?.user) {
					await authClient.signIn.anonymous()
				}

				setReady(true)
			}
		}

		init()

		return () => {
			cancelled = true
		}
	}, [])

	if (!ready) {
		return (
			<div className="fixed inset-0 flex items-center justify-center overflow-hidden">
				Redirecting to chat
			</div>
		)
	}

	return <>{children}</>
}

export default AuthGate
