import { BabyIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { LoginForm } from '@/components/auth/login-card'

export const metadata: Metadata = {
  title: 'Sign In | PediaCare Clinic',
  description: 'Secure access to your pediatric clinic dashboard.',
}

export default async function LoginPage() {
  const t = await getTranslations('Auth')

  return (
    // Main container for the entire page, centered both horizontally and vertically
    <main className='flex min-h-screen flex-col items-center justify-center bg-muted px-6 py-12 md:py-20'>
      {/* The main card/section for the login form and related content */}
      <section className='w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg dark:bg-background'>
        {/* Header section with the logo and app name */}
        <header className='flex flex-col items-center gap-2 text-center'>
          <Link
            aria-label='PediaCare Home'
            className='flex flex-col items-center justify-center gap-1'
            href='/'
          >
            <div className='flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <BabyIcon className='size-6' />
            </div>
            <span className='font-semibold text-lg tracking-tight'>
              PediaCare Clinic
            </span>
          </Link>
        </header>

        {/* The main login form area */}
        <div className='w-full space-y-6'>
          <div className='space-y-2 text-center'>
            <h1 className='font-bold text-2xl tracking-tight'>{t('login')}</h1>
            <p className='text-muted-foreground text-sm'>
              {t('loginDescription')}
            </p>
          </div>

          {/* The login form component */}
          <LoginForm />

          {/* Registration link */}
          <p className='text-center text-muted-foreground text-sm'>
            {t('dontHaveAccount')}{' '}
            <Link
              className='font-medium text-primary hover:underline'
              href='/register'
            >
              {t('register')}
            </Link>
          </p>
        </div>

        {/* Terms of Service and Privacy Policy links */}
        <p className='text-center text-muted-foreground text-xs'>
          By continuing, you agree to our{' '}
          <Link
            className='underline hover:text-primary'
            href='/terms'
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            className='underline hover:text-primary'
            href='/privacy'
          >
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
