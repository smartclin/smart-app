'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

import { Button } from '../ui/button'

export const CardWrapper = ({
	children,
	title,
	description,
	hasLogo = false,
	logoSrc,
	footerRef,
	param,
	ref,
}: {
	children: React.ReactNode
	title: string
	description: string
	hasLogo?: boolean
	logoSrc?: string
	footerRef?: 'login' | 'register' | 'registerWithRedirect' | 'loginWithRedirect'
	param?: string
	ref?: React.Ref<HTMLDivElement>
}) => {
	return (
		<Card
			className="w-full md:w-[400px]"
			ref={ref}
		>
			<CardHeader className="text-center">
				{hasLogo && (
					<div className="mb-4 size-14 self-center rounded-full">
						<Button
							className="h-full w-full bg-center bg-contain bg-no-repeat"
							style={{
								backgroundImage: `url('${logoSrc}')`,
							}}
							variant="ghost"
						/>
					</div>
				)}
				<CardTitle className="text-xl">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="rounded-b-2xl border-slate-300/50 border-b-[2px] px-8 shadow-sm">
				{children}
			</CardContent>
			<CardFooter className="flex justify-center rounded-b-2xl border-t-slate-200/10 bg-gray-200/30 p-4 py-[6px]">
				{footerRef === 'login' && (
					<span className="text-muted-foreground/70 text-sm">
						Already have an account?{' '}
						<Button
							className="px-1 font-[400px] text-[14px] text-blue-500 leading-4 after:bg-blue-600 hover:text-blue-600"
							onClick={() => window.location.replace('/login')}
							size={'sm'}
							type="button"
							variant={'link'}
						>
							Sign In
						</Button>
					</span>
				)}
				{footerRef === 'register' && (
					<span className="text-muted-foreground/70 text-sm">
						Don&apos;t have an account?{' '}
						<Button
							className="px-1 font-[400px] text-[14px] text-blue-500 leading-4 after:bg-blue-600 hover:text-blue-600"
							onClick={() => window.location.replace('/signup')}
							size={'sm'}
							type="button"
							variant={'link'}
						>
							Sign Up
						</Button>
					</span>
				)}
				{footerRef === 'registerWithRedirect' && (
					<span className="text-muted-foreground/70 text-sm">
						Don&apos;t have an account?{' '}
						<Button
							className="px-1 font-[400px] text-[14px] text-blue-500 leading-4 after:bg-blue-600 hover:text-blue-600"
							onClick={() =>
								window.location.replace(`/signup?redirect=${encodeURIComponent(param ?? '')}`)
							}
							size={'sm'}
							type="button"
							variant={'link'}
						>
							Sign Up
						</Button>
					</span>
				)}
				{footerRef === 'loginWithRedirect' && (
					<span className="text-muted-foreground/70 text-sm">
						Already have an account?{' '}
						<Button
							className="px-1 font-[400px] text-[14px] text-blue-500 leading-4 after:bg-blue-600 hover:text-blue-600"
							onClick={() =>
								window.location.replace(`/login?redirect=${encodeURIComponent(param ?? '')}`)
							}
							size={'sm'}
							type="button"
							variant={'link'}
						>
							Sign In
						</Button>
					</span>
				)}
			</CardFooter>
		</Card>
	)
}
