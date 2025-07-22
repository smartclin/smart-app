'use client'

import type { User } from 'better-auth'
import { UserCheck, UserX } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ObfuscatedLink } from '@/config/ObfuscatedLink'
import { toast } from '@/hooks/use-toast'
import { useRouter } from '@/i18n/navigation'
import { authClient, useSession } from '@/lib/auth/auth-client'

type UserButtonProps = {
	setIsMobileNavOpen?: Dispatch<SetStateAction<boolean>>
	className?: string
}

const UserButton = ({ setIsMobileNavOpen, className }: UserButtonProps) => {
	const t = useTranslations('auth')
	const router = useRouter()
	const { data: session } = useSession()
	const user = session?.user as User & {
		role: string
		fournisseurId?: number
		clientId?: number
	}

	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push('/')
						toast({
							title: t('deconnexion-reussie'),
							description: t('vous-avez-ete-deconnecte-avec-succes'),
							variant: 'default',
						})
					},
				},
			})
		} catch (err) {
			console.error('Erreur lors de la deconnexion:', err)
		}
	}
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				asChild
				className={'cursor-pointer'}
			>
				<Button
					aria-label="user menu"
					className={`flex items-center justify-center rounded-full ${!user?.image ? 'p-2' : ''} ${className}`}
					size="icon"
					title={t('connexion')}
					variant="outline"
				>
					{session ? (
						user?.image ? (
							<Image
								alt="avatar-utilisateur"
								className={`${user.role === 'admin' ? 'object-cover' : 'object-contain'}`}
								height={32}
								src={user.image}
								width={32}
							/>
						) : (
							<UserCheck />
						)
					) : (
						<UserX />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{session && user?.role && (
					<DropdownMenuItem
						asChild
						onClick={setIsMobileNavOpen ? () => setIsMobileNavOpen(false) : undefined}
					>
						{user?.role === 'admin' ? (
							<ObfuscatedLink
								className="!text-base cursor-default"
								href={{
									pathname: '/admin/[adminId]/dashboard',
									params: { adminId: user.id },
								}}
							>
								{t('mon-espace')}
							</ObfuscatedLink>
						) : user?.role === 'client' ? (
							<ObfuscatedLink
								className="!text-base cursor-default"
								href={{
									pathname: '/client/[clientId]/dashboard',
									params: { clientId: user.clientId?.toString() ?? '0' },
								}}
							>
								{t('mon-espace')}
							</ObfuscatedLink>
						) : (
							<ObfuscatedLink
								className="!text-base cursor-default"
								href={{
									pathname: '/fournisseur/[fournisseurId]/dashboard',
									params: {
										fournisseurId: user.fournisseurId?.toString() ?? '0',
									},
								}}
							>
								{t('mon-espace')}
							</ObfuscatedLink>
						)}
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					asChild
					onClick={setIsMobileNavOpen ? () => setIsMobileNavOpen(false) : undefined}
				>
					{session ? (
						<p
							className="!text-base"
							onClick={handleSignOut}
							onKeyUp={handleSignOut}
						>
							{t('deconnexion')}
						</p>
					) : (
						<ObfuscatedLink
							className="!text-base cursor-default"
							href="/auth/signin"
						>
							{t('connexion')}
						</ObfuscatedLink>
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default UserButton
