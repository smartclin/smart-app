import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'
import { api } from '@/trpc/server'
import { getUserRole } from '@/utils/roles'

import CallToAction from './_components/CTA'
import Features from './_components/Features'
import Hero from './_components/Hero'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
	const session = await getSession()
	const userId = session?.user.id
	const role = userId ? await getUserRole() : null

	if (userId && role) {
		redirect(`/${role.toLowerCase()}`)
	}

	let _apiHealthy = false
	try {
		const status = await api.healthCheck()
		_apiHealthy = status === 'OK'
	} catch (e) {
		console.error('API health check failed:', e)
	}

	return (
		<div className="flex min-h-screen flex-col">
			<Hero siteMetadata={{ name: '', description: '' }} />
			<Features />
			<CallToAction />
		</div>
	)
}
