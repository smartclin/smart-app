'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ellipsis, Eye, EyeOff, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import QrCode from 'react-qr-code';
import * as z from 'zod';

import { ErrorCard } from '@/components/auth/error-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AuthUser } from '@/hooks/use-auth';
import { useAutoSubmit } from '@/hooks/use-auto-submit';
import { authClient } from '@/lib/auth/auth-client';

import { SplitOTP } from '../split-otp';

const twoFactorPasswordSchema = z.object({
  currentPassword: z.string().min(8)
});

const totpCodeSchema = z.object({
  otp: z.string().min(6, {
    message: 'Code must be 6 digits long'
  })
});

const removeTwoFactorSchema = z.object({
  currentPassword: z.string().min(8)
});

export const TwoFactorSection = ({ user }: { user: AuthUser }) => {
  const [animate] = useAutoAnimate();
  const router = useRouter();
  const [isTwoFactorBoxOpen, setIsTwoFactorBoxOpen] = useState(false);
  const [isRemoveTwoFactorBoxOpen, setIsRemoveTwoFactorBoxOpen] = useState(false);
  const [twoFactorStage, setTwoFactorStage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totpUri, setTotpUri] = useState('');
  const toggleVisibility = () => setIsPasswordVisible(prevState => !prevState);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const is2FAEnabled = user.twoFactorEnabled;

  const twoFactorForm = useForm<z.infer<typeof twoFactorPasswordSchema>>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      currentPassword: ''
    }
  });

  const totpCodeForm = useForm<z.infer<typeof totpCodeSchema>>({
    resolver: zodResolver(totpCodeSchema),
    defaultValues: {
      otp: ''
    }
  });

  const removeTwoFactorForm = useForm<z.infer<typeof removeTwoFactorSchema>>({
    resolver: zodResolver(removeTwoFactorSchema),
    defaultValues: {
      currentPassword: ''
    }
  });

  const onTwoFactorPasswordSubmit = async (data: z.infer<typeof twoFactorPasswordSchema>) => {
    const { data: totpUri } = await authClient.twoFactor.enable(
      {
        password: data.currentPassword
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setIsLoading(false);
          setTwoFactorStage(2);
        },
        onError: ctx => {
          setError(ctx.error.message);
          setIsLoading(false);
        }
      }
    );

    setTotpUri(totpUri?.totpURI ?? '');
  };

  const onTotpCodeSubmit = async (data: z.infer<typeof totpCodeSchema>) => {
    await authClient.twoFactor.verifyTotp(
      {
        code: data.otp
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setIsLoading(false);
          setTwoFactorStage(4);
        },
        onError: ctx => {
          setError(ctx.error.message);
          setIsLoading(false);
        }
      }
    );
  };

  useAutoSubmit({
    trigger: totpCodeForm.trigger,
    watch: totpCodeForm.watch,
    onSubmit: totpCodeForm.handleSubmit(onTotpCodeSubmit)
  });

  const onRemoveTwoFactorSubmit = async (data: z.infer<typeof removeTwoFactorSchema>) => {
    await authClient.twoFactor.disable(
      {
        password: data.currentPassword
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setIsLoading(false);
          setIsRemoveTwoFactorBoxOpen(false);
          setTwoFactorStage(1);
          router.refresh();
        },
        onError: ctx => {
          setError(ctx.error.message);
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <div className='flex flex-col gap-10 md:w-[72%]'>
      <div ref={animate}>
        {!isTwoFactorBoxOpen && !isRemoveTwoFactorBoxOpen ? (
          <div className='min-w-[350px]'>
            <DropdownMenu>
              <div className='flex items-center justify-between'>
                <p className='font-medium text-sm'>Two-step verification</p>
                {!is2FAEnabled ? (
                  <DropdownMenuTrigger asChild>
                    <Button
                      className='text-sm'
                      size={'sm'}
                      variant={'ghost'}
                    >
                      Add two-step verification
                    </Button>
                  </DropdownMenuTrigger>
                ) : (
                  <div className='flex min-w-[50%] items-center gap-2'>
                    <svg
                      className='size-5 text-zinc-700'
                      fill='currentColor'
                      viewBox='0 0 16 16'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <title>Path</title>
                      <path d='M7 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z' />
                      <path
                        clipRule='evenodd'
                        d='M4 2c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2H4Zm3 9a3.002 3.002 0 0 0 2.906-2.25H12a.75.75 0 0 0 0-1.5H9.906A3.002 3.002 0 0 0 4 8c0 .941.438 1.785 1.117 2.336A2.985 2.985 0 0 0 7 11Z'
                        fillRule='evenodd'
                      />
                    </svg>
                    <p className='mr-2 text-xs text-zinc-600'>Authenticator app</p>
                    <Badge variant={'outline'}>Default</Badge>
                  </div>
                )}
                {is2FAEnabled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className='group'
                        size='icon'
                        variant={'ghost'}
                      >
                        <Ellipsis className='h-4 w-4 text-zinc-400 transition group-hover:text-zinc-800' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='center'
                      className='min-w-fit rounded-lg px-3 py-1 shadow-lg'
                    >
                      <DropdownMenuItem
                        className='cursor-pointer p-0'
                        onClick={() => {
                          setIsRemoveTwoFactorBoxOpen(true);
                          setTwoFactorStage(10);
                        }}
                      >
                        <p className='text-destructive text-sm'>Remove</p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DropdownMenuContent
                  align='center'
                  className='rounded-lg shadow-lg'
                  onClick={() => {
                    setIsTwoFactorBoxOpen(true);
                  }}
                >
                  <DropdownMenuItem className='cursor-pointer'>
                    <svg
                      className='text-zinc-700'
                      fill='currentColor'
                      viewBox='0 0 16 16'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <title>Path</title>
                      <path d='M7 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z' />
                      <path
                        clipRule='evenodd'
                        d='M4 2c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2H4Zm3 9a3.002 3.002 0 0 0 2.906-2.25H12a.75.75 0 0 0 0-1.5H9.906A3.002 3.002 0 0 0 4 8c0 .941.438 1.785 1.117 2.336A2.985 2.985 0 0 0 7 11Z'
                        fillRule='evenodd'
                      />
                    </svg>
                    <p className='text-sm text-zinc-600'>Authenticator app</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </div>
            </DropdownMenu>
          </div>
        ) : (
          <Card className='shadow-md'>
            <CardHeader>
              <CardTitle className='text-sm tracking-tight'>
                {twoFactorStage === 1 && 'First enter your current password'}
                {twoFactorStage === 10 && 'First enter your current password'}
                {twoFactorStage === 2 && 'Add authenticator application'}
                {twoFactorStage === 3 && 'Add authenticator application'}
                {twoFactorStage === 4 && 'Add authenticator application'}
              </CardTitle>
              {twoFactorStage === 2 && (
                <CardDescription className='text-xs'>
                  Set up a new signin method in your authenticator app and scan the following QR
                  code to link it to your account.
                </CardDescription>
              )}
              {twoFactorStage === 10 && (
                <CardDescription className='text-xs'>
                  To remove two-factor authentication, enter your current password.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {twoFactorStage === 1 && (
                <>
                  <div ref={animate}>
                    {error && (
                      <ErrorCard
                        error={error}
                        size='sm'
                      />
                    )}
                  </div>
                  <Form {...twoFactorForm}>
                    <form
                      className='space-y-6'
                      onSubmit={twoFactorForm.handleSubmit(onTwoFactorPasswordSubmit)}
                    >
                      <FormField
                        control={twoFactorForm.control}
                        name='currentPassword'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-sm'>Current Password</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  {...field}
                                  autoComplete='off'
                                  autoCorrect='off'
                                  className='pe-9'
                                  disabled={isLoading}
                                  type={isPasswordVisible ? 'text' : 'password'}
                                />
                                <button
                                  aria-controls='password'
                                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                  aria-pressed={isPasswordVisible}
                                  className='absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                                  onClick={toggleVisibility}
                                  type='button'
                                >
                                  {isPasswordVisible ? (
                                    <EyeOff
                                      aria-hidden='true'
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  ) : (
                                    <Eye
                                      aria-hidden='true'
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        className='mt-4 mr-2'
                        disabled={isLoading}
                        onClick={() => {
                          setIsTwoFactorBoxOpen(false);
                          setIsRemoveTwoFactorBoxOpen(false);
                          twoFactorForm.reset();
                          setError('');
                        }}
                        size={'sm'}
                        type='button'
                        variant={'ghost'}
                      >
                        Cancel
                      </Button>
                      <Button
                        className='mt-4'
                        disabled={isLoading}
                        size={'sm'}
                        type='submit'
                      >
                        {isLoading && (
                          <Loader className='mr-1 size-2 animate-spin text-muted-foreground' />
                        )}
                        Save
                      </Button>
                    </form>
                  </Form>
                </>
              )}
              {twoFactorStage === 2 && (
                <>
                  <div className='flex flex-col items-center justify-center'>
                    <QrCode
                      className='size-[170px]'
                      value={totpUri || ''}
                    />
                  </div>
                  <Button
                    className='mt-10 mr-2'
                    disabled={isLoading}
                    onClick={() => {
                      setIsTwoFactorBoxOpen(false);
                      twoFactorForm.reset();
                      setError('');
                    }}
                    size={'sm'}
                    type='button'
                    variant={'ghost'}
                  >
                    Cancel
                  </Button>
                  <Button
                    className='mt-10'
                    disabled={isLoading}
                    onClick={() => {
                      setTwoFactorStage(3);
                    }}
                    size={'sm'}
                    type='button'
                  >
                    {isLoading && (
                      <Loader className='mr-1 size-2 animate-spin text-muted-foreground' />
                    )}
                    Continue
                  </Button>
                </>
              )}
              {twoFactorStage === 3 && (
                <>
                  <div ref={animate}>
                    {error && (
                      <ErrorCard
                        error={error}
                        size='sm'
                      />
                    )}
                  </div>
                  <Form {...totpCodeForm}>
                    <form
                      className='flex flex-col items-center justify-center space-y-6'
                      onSubmit={totpCodeForm.handleSubmit(() => onTotpCodeSubmit)}
                    >
                      <FormField
                        control={totpCodeForm.control}
                        name='otp'
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {/* @ts-expect-error Just a simple type error */}
                              <SplitOTP
                                {...field}
                                disabled={isLoading}
                                maxLength={6}
                              />
                            </FormControl>
                            <FormDescription className='text-xs'>
                              Enter the code in your authenticator app.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='self-start'>
                        <Button
                          className='mt-4 mr-2'
                          disabled={isLoading}
                          onClick={() => {
                            setIsTwoFactorBoxOpen(false);
                            twoFactorForm.reset();
                            totpCodeForm.reset();
                            setTwoFactorStage(1);
                            setError('');
                          }}
                          size={'sm'}
                          type='button'
                          variant={'ghost'}
                        >
                          Cancel
                        </Button>
                        <Button
                          className='mt-4'
                          disabled={isLoading}
                          onClick={() => {
                            onTotpCodeSubmit({
                              otp: totpCodeForm.getValues().otp
                            });
                          }}
                          size={'sm'}
                          type='button'
                        >
                          {isLoading && (
                            <Loader className='mr-1 size-2 animate-spin text-muted-foreground' />
                          )}
                          Continue
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
              {twoFactorStage === 4 && (
                <div className='flex flex-col'>
                  <CardDescription className='text-xs'>
                    Two-step verification is now enabled. When signing in, you will need to enter a
                    verification code from this authenticator as an additional step.
                  </CardDescription>
                  <Button
                    className='mt-4 self-end'
                    disabled={isLoading}
                    onClick={() => {
                      setIsTwoFactorBoxOpen(false);
                      twoFactorForm.reset();
                      totpCodeForm.reset();
                      setError('');
                    }}
                    size={'sm'}
                    type='button'
                  >
                    Finish
                  </Button>
                </div>
              )}
              {twoFactorStage === 10 && (
                <>
                  <div ref={animate}>
                    {error && (
                      <ErrorCard
                        error={error}
                        size='sm'
                      />
                    )}
                  </div>
                  <Form {...removeTwoFactorForm}>
                    <form
                      className='space-y-6'
                      onSubmit={removeTwoFactorForm.handleSubmit(onRemoveTwoFactorSubmit)}
                    >
                      <FormField
                        control={removeTwoFactorForm.control}
                        name='currentPassword'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-sm'>Current Password</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  {...field}
                                  autoComplete='off'
                                  autoCorrect='off'
                                  className='pe-9'
                                  disabled={isLoading}
                                  type={isPasswordVisible ? 'text' : 'password'}
                                />
                                <button
                                  aria-controls='password'
                                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                  aria-pressed={isPasswordVisible}
                                  className='absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                                  onClick={toggleVisibility}
                                  type='button'
                                >
                                  {isPasswordVisible ? (
                                    <EyeOff
                                      aria-hidden='true'
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  ) : (
                                    <Eye
                                      aria-hidden='true'
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        className='mt-4 mr-2'
                        disabled={isLoading}
                        onClick={() => {
                          setIsTwoFactorBoxOpen(false);
                          setIsRemoveTwoFactorBoxOpen(false);
                          twoFactorForm.reset();
                          setError('');
                        }}
                        size={'sm'}
                        type='button'
                        variant={'ghost'}
                      >
                        Cancel
                      </Button>
                      <Button
                        className='mt-4'
                        disabled={isLoading}
                        size={'sm'}
                        type='submit'
                      >
                        {isLoading && (
                          <Loader className='mr-1 size-2 animate-spin text-muted-foreground' />
                        )}
                        Save
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
