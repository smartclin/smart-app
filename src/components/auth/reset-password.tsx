'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { type SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/auth-client';

import { CardWrapper } from './card-wrapper';
import { ErrorCard } from './error-card';

const formSchema = z.object({
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long'
  })
});

export const ResetPasswordCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const params = useSearchParams();
  const redirectParam = params.get('redirect');

  const token = params.get('token');

  const router = useRouter();

  const toggleVisibility = () => setIsPasswordVisible(prevState => !prevState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: ''
    }
  });

  if (!token) {
    redirect('/login');
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    authClient.resetPassword(
      {
        newPassword: data.password,
        token
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success('Password reset successfully.');
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        },
        onError: (ctx: { error: { message: SetStateAction<string> } }) => {
          setError(ctx.error.message);
          setIsLoading(false);
        }
      }
    );
  };

  const [animateRef] = useAutoAnimate();

  return (
    <CardWrapper
      description='Enter your new password below.'
      footerRef={redirectParam ? 'registerWithRedirect' : 'register'}
      param={redirectParam ?? ''}
      ref={animateRef}
      title='Reset Password'
    >
      <div ref={animateRef}>{error && <ErrorCard error={error} />}</div>
      <Form {...form}>
        <form
          autoComplete='off'
          className='flex flex-col space-y-8'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div>
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className='w-full bg-blue-500 shadow-inner hover:bg-blue-600 hover:ring-blue-600'
            disabled={isLoading}
            ref={animateRef}
            size='sm'
            type='submit'
          >
            {isLoading && (
              <Loader className='mr-3 ml-3 size-4 animate-spin text-center text-white' />
            )}
            {!isLoading && 'Reset password'}
            {!isLoading && (
              <svg className='-ml-1 mt-2 text-white/50'>
                <title>Path</title>{' '}
                <path
                  d='m7.25 5-3.5-2.25v4.5L7.25 5Z'
                  fill='currentColor'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                />
              </svg>
            )}
          </Button>
          <Button
            className='mt-2 self-center text-blue-500 text-sm transition-all after:bg-blue-600 hover:text-blue-600 focus-visible:border-1 focus-visible:border-ring/20 focus-visible:ring-2 focus-visible:ring-ring/20'
            disabled={isLoading}
            onClick={() => router.push('/login')}
            size={'sm'}
            type='button'
            variant={'link'}
          >
            Back to login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
