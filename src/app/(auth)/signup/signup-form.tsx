'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { signUp } from '@/lib/auth/auth-client';

export const signupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' })
});

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: standardSchemaResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsSubmitting(true);

    try {
      await signUp.email(
        {
          name: values.name,
          email: values.email,
          password: values.password
        },
        {
          onSuccess: () => {
            toast.success('Account created', {
              description: 'Welcome! Redirecting to your dashboard...'
            });
            router.replace('/dashboard');
          },
          onError: ({ error }) => {
            toast.error('Signup failed', { description: error.message });
          }
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='John Doe'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder='johndoe@example.com'
                  type='email'
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
                  autoComplete='new-password'
                  placeholder='••••••••'
                  type={showPassword ? 'text' : 'password'}
                  {...field}
                />
              </FormControl>
              <FormDescription className='flex items-center justify-between text-xs'>
                <label className='flex cursor-pointer items-center gap-2'>
                  <Checkbox
                    checked={showPassword}
                    onCheckedChange={checked => setShowPassword(!!checked)}
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
          disabled={isSubmitting}
          type='submit'
        >
          {isSubmitting ? (
            <span className='flex items-center justify-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
              Creating account...
            </span>
          ) : (
            'Sign up'
          )}
        </Button>
      </form>
    </Form>
  );
}
