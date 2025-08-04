'use client'

import { IconDotsVertical, IconLogout } from '@tabler/icons-react'
import { createAuthClient } from 'better-auth/react'
import { CommandIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { trpc } from '@/trpc/client'

import SearchCommand from '../modals/SearchCommand'

interface Props {
	name: string
	email: string
	image: string
}

const UserInfo = ({ name, email, image }: Props) => {
	const [openSearch, setOpenSearch] = useState(false)

	const { isMobile } = useSidebar()

	const utils = trpc.useUtils()

	const authClient = createAuthClient()

	const signOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					utils.user.getCurrentUser.invalidate()
					window.location.replace('/')
				},
				onError: error => {
					console.log("Couldn't sign out", error)
				},
			},
		})
	}

	return (
		<>
			<SearchCommand
				onOpenChange={setOpenSearch}
				open={openSearch}
			/>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								size="lg"
							>
								<Avatar className="h-8 w-8 rounded-full">
									<AvatarImage
										alt={name}
										src={image}
									/>
									<AvatarFallback className="rounded-full">
										<Image
											alt="fallback"
											className="rounded-full"
											height={32}
											src="https://avatar.vercel.sh/jack"
											width={32}
										/>
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{name}</span>
									<span className="truncate text-muted-foreground text-xs">{email}</span>
								</div>
								<IconDotsVertical className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							side={isMobile ? 'bottom' : 'right'}
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-full">
										<AvatarImage
											alt={name}
											src={image}
										/>
										<AvatarFallback className="rounded-full">
											<Image
												alt="fallback"
												className="rounded-full"
												height={32}
												src="https://avatar.vercel.sh/jack"
												width={32}
											/>
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{name}</span>
										<span className="truncate text-muted-foreground text-xs">{email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setOpenSearch(true)}>
									<div className="flex items-center gap-0.5">
										<CommandIcon /> <span className="font-medium text-sm">+ k</span>
									</div>
									Search
								</DropdownMenuItem>
								{/* todo: Manage Account Settings from Clerk */}
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={signOut}>
								<IconLogout />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	)
}

export default UserInfo
