'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useCurrentUser } from '@/hooks/use-auth'
import { authClient } from '@/lib/auth/auth-client'

import { Skeleton } from './ui/skeleton'

export function NavUser() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useCurrentUser()
  const isLoading = !user
  const { theme = 'system', setTheme } = useTheme()

  if (isLoading || !user) {
    return <NavUserSkeleton />
  }

  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('') ?? 'U'

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      queryClient.clear()
      router.push('/login')
      toast.success('You have been logged out.')
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              size='lg'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  alt={user.name ?? ''}
                  src={user.avatar ?? ''}
                />
                <AvatarFallback className='rounded-lg bg-accent-foreground text-background'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.name}</span>
                <span className='truncate text-muted-foreground text-xs'>
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='start'
            className='min-w-56 rounded-lg'
            side='top'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    alt={user.name ?? ''}
                    src={user.avatar ?? ''}
                  />
                  <AvatarFallback className='rounded-lg'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.name}</span>
                  <span className='truncate text-muted-foreground text-xs'>
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Settings className='mr-2 h-4 w-4' />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className='ps-8'>
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className='min-w-64'>
                  <DropdownMenuRadioGroup
                    onValueChange={setTheme}
                    value={theme}
                  >
                    <DropdownMenuRadioItem value='system'>
                      System
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value='light'>
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value='dark'>
                      Dark
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-8 animate-shimmer rounded-lg bg-neutral-500/20' />
          <div className='flex-1 space-y-1'>
            <Skeleton className='h-4 w-24 animate-shimmer rounded bg-neutral-500/20' />
            <Skeleton className='h-2 w-32 animate-shimmer rounded bg-neutral-500/20' />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
