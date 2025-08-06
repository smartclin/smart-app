'use client'

import { LogIn } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

const LoginButton = () => {
	return (
		<Link
			className="flex w-full"
			href="/auth"
		>
			<Button
				className="w-full justify-start gap-4"
				size="lg"
				variant="ghost"
			>
				<LogIn /> Log In
			</Button>
		</Link>
	)
}

export default LoginButton
