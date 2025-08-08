'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { Session } from 'better-auth';
import { Loader, PlusCircle, UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import type { AuthUser } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth/auth-client';

import { ProfileSection } from './profile-section';
import { SecuritySection } from './security/security-section';

interface UserButtonProps {
  user: AuthUser;
}

export const UserButton = ({ user }: UserButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [_animate] = useAutoAnimate();

  const router = useRouter();

  useEffect(() => {
    const getSessions = async () => {
      await authClient.multiSession
        .listDeviceSessions()
        // @ts-expect-error Just a simple type error
        .then(res => setSessions(res.data));
    };
    getSessions();
  }, []);

  if (!user) return;

  return (
    <Dialog onOpenChange={() => router.refresh()}>
      <DropdownMenu>
        <DropdownMenuTrigger className='focus-visible:border-1 focus-visible:border-ring/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20'>
          <Avatar>
            <AvatarImage src={user?.image ?? ''} />
            <AvatarFallback className='bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white'>
              <UserIcon className='size-4' />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-80 rounded-xl p-0 shadow-lg md:w-96'>
          <DropdownMenuLabel className='p-3 px-6'>
            <div className='flex items-center gap-4'>
              <Avatar>
                <AvatarImage src={user?.image ?? ''} />
                <AvatarFallback className='bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white'>
                  <UserIcon className='size-4' />
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <p className='font-[460] text-sm'>{user.name}</p>
                <p className='font-[460] text-xs'>{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DialogTrigger asChild>
            <DropdownMenuItem
              className='group cursor-pointer px-6 py-4 font-medium text-black/70'
              disabled={isLoading}
            >
              <svg
                className='h-4 w-4 text-zinc-600 transition-all group-hover:text-zinc-800'
                fill='currentColor'
                viewBox='0 0 16 16'
                xmlns='http://www.w3.org/2000/svg'
              >
                <title>Manage</title>
                <path
                  clipRule='evenodd'
                  d='M6.559 2.536A.667.667 0 0 1 7.212 2h1.574a.667.667 0 0 1 .653.536l.22 1.101a4.654 4.654 0 0 1 1.287.744l1.065-.36a.667.667 0 0 1 .79.298l.787 1.362a.666.666 0 0 1-.136.834l-.845.742c.079.492.079.994 0 1.486l.845.742a.666.666 0 0 1 .137.833l-.787 1.363a.667.667 0 0 1-.791.298l-1.065-.36a4.664 4.664 0 0 1-1.286.744l-.22 1.101a.666.666 0 0 1-.654.536H7.212a.666.666 0 0 1-.653-.536l-.22-1.101a4.664 4.664 0 0 1-1.287-.744l-1.065.36a.666.666 0 0 1-.79-.298L2.41 10.32a.667.667 0 0 1 .136-.834l.845-.743a4.7 4.7 0 0 1 0-1.485l-.845-.742a.667.667 0 0 1-.137-.833l.787-1.363a.667.667 0 0 1 .791-.298l1.065.36a4.654 4.654 0 0 1 1.287-.744l.22-1.101ZM7.999 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'
                  fillRule='evenodd'
                />
              </svg>
              <span className='ml-2'>Manage Account</span>
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className='cursor-pointer px-6 py-4 font-medium text-black/70'
            disabled={isLoading}
            onClick={() => {
              const session = sessions.find(s => s.id === user.session?.session.id); // Corrected here
              if (!session) return;

              setIsLoading(true);
              authClient.multiSession.revoke(
                { sessionToken: session.token ?? '' },
                {
                  onSuccess: () => {
                    setIsLoading(false);
                    window.location.reload();
                  },
                  onError: () => setIsLoading(false)
                }
              );
            }}
            onSelect={e => e.preventDefault()}
          >
            {isLoading ? (
              <Loader className='mr-1 size-4 animate-spin text-muted-foreground' />
            ) : (
              <UserIcon className='size-4 text-zinc-600' />
            )}
            <span className='ml-2'>Sign Out</span>
          </DropdownMenuItem>

          {sessions.length > 1 &&
            sessions
              .filter(session => session.id !== user.session?.session.id) // Corrected here
              .map(session => (
                <DropdownMenuItem
                  className='cursor-pointer p-3 px-6'
                  key={session.id}
                  onClick={() => {
                    authClient.multiSession.setActive(
                      { sessionToken: session.token ?? '' },
                      {
                        onSuccess: () => window.location.reload()
                      }
                    );
                  }}
                >
                  <div className='flex items-center gap-4'>
                    <Avatar>
                      <AvatarImage src={user.image ?? ''} />
                      <AvatarFallback className='bg-gradient-to-b from-gray-700 via-gray-900 to-black text-white'>
                        <UserIcon className='size-4' />
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <p className='font-[460] text-sm'>{user.name}</p>
                      <p className='font-[460] text-xs'>{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className='cursor-pointer px-6 py-4 font-medium text-black/70'
            disabled={isLoading}
            onClick={() => router.push('/login')}
          >
            <PlusCircle className='mr-2 size-4' />
            Add Account
          </DropdownMenuItem>

          {sessions.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='cursor-pointer px-6 py-4 font-medium text-black/70'
                disabled={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  authClient.signOut(
                    {},
                    {
                      onSuccess: () => router.refresh()
                    }
                  );
                }}
              >
                {isLoading ? (
                  <Loader className='mr-1 size-4 animate-spin text-muted-foreground' />
                ) : (
                  <UserIcon className='size-4 text-zinc-600' />
                )}
                <span className='ml-2'>Sign Out of All Accounts</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className='max-h-[650px] w-full overflow-y-auto overflow-x-hidden md:min-w-[850px]'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Account Settings</DialogTitle>
          <DialogDescription className='text-sm'>Manage your account settings.</DialogDescription>
        </DialogHeader>
        <Separator className='bg-border/50' />
        <div className='flex flex-col gap-3'>
          <ProfileSection user={user} />
          <Separator className='h-[2px] bg-border/50' />
          <SecuritySection user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserButton;
