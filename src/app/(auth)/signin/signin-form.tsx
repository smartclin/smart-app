'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { signIn } from '@/lib/auth/auth-client';

const signinSchema = z.object({
  email: z.email({ message: 'Enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' })
});

export default function SigninForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: standardSchemaResolver(signinSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof signinSchema>) => {
    setIsPending(true);
    await signIn
      .email(
        { email: values.email, password: values.password },
        {
          onSuccess: () => {
            toast.success('Welcome back 👋', {
              description: 'Redirecting to your dashboard...'
            });
            router.replace('/dashboard');
          },
          onError: ({ error }) => {
            toast.error('Login failed', { description: error.message });
          }
        }
      )
      .catch(() => {})
      .finally(() => setIsPending(false));
  };

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete='email'
                  placeholder='e.g. pediacare@clinic.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  autoComplete='current-password'
                  placeholder='********'
                  type={showPassword ? 'text' : 'password'}
                  {...field}
                />
              </FormControl>
              <FormDescription className='flex items-center justify-between text-muted-foreground text-sm'>
                <Link
                  className='underline hover:text-primary'
                  href='/forgot-password'
                >
                  Forgot password?
                </Link>
                <label className='flex cursor-pointer items-center gap-2'>
                  <Checkbox
                    checked={showPassword}
                    onCheckedChange={() => setShowPassword(prev => !prev)}
                  />
                  Show password <textarea />
                </label>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className='w-full'
          disabled={isPending}
          type='submit'
        >
          {isPending ? (
            <div className='flex items-center gap-2'>
              <div className='size-3 animate-spin rounded-full border-white border-t-2' />
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </Form>
  );
}
