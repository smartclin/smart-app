'use client'

import { WandSparkles } from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarSeparator,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/trpc/client'

import ChatList from './ChatList'
import LoginButton from './LoginButton'
import SidebarUtils from './SidebarUtils'
import UserInfo from './UserInfo'

const ChatSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
	const { data, isLoading } = trpc.user.getCurrentUser.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})

	return (
		<Sidebar
			collapsible="offcanvas"
			{...props}
		>
			<SidebarHeader className="py-3.5">
				<SidebarMenu>
					<SidebarMenuItem>
						<Link
							className="flex items-center gap-2 p-1.5"
							href="/"
						>
							<WandSparkles className="!size-5" />
							<span className="font-semibold text-base">Ai Chat</span>
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="overflow-x-hidden">
				<SidebarUtils />

				<SidebarSeparator />
				<ChatList />
			</SidebarContent>
			<SidebarFooter>
				{isLoading ? (
					<Skeleton className="h-5 rounded-md" />
				) : data && data.name === 'Anonymous' ? (
					<LoginButton />
				) : (
					<UserInfo
						email={data?.email ?? 'johndoe@example.com'}
						image={data?.image ?? 'https://avatar.vercel.sh/jack'}
						name={data?.name ?? 'John Doe'}
					/>
				)}
			</SidebarFooter>
		</Sidebar>
	)
}

export default ChatSidebar
