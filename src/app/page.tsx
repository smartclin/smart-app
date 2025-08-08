import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, HeartPulse } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { UserButton } from '@/components/auth/user-button'
import FloatingAnimation from '@/components/floating-animation'
import { LanguageToggle } from '@/components/language/toggle'
import { MotionDiv, MotionSpan } from '@/components/motionDev'
import { ThemeToggle } from '@/components/theme/toggle'
import { Toast } from '@/components/toast'
import { Button } from '@/components/ui/button'
import { appRoutes } from '@/config'
import { getServerSession } from '@/lib/auth/server'
import { api, HydrateClient } from '@/trpc/server'
import { getUserRole } from '@/utils/roles'

import { FeaturesSection } from './_components/Features'

export default async function HomePage({
  siteMetadata,
}: {
  siteMetadata: { name: string; description: string }
}) {
  const t = await getTranslations('HomePage')
  const session = await getServerSession()
  const userId = session?.user.id
  const role = userId ? await getUserRole() : null

  // Redirect a logged-in user to their specific dashboard
  if (userId && role) {
    redirect(`/${role.toLowerCase()}`)
  }

  // Fetch API health status
  const healthStatus = await api.healthCheck.prefetch().catch(() => null)

  return (
    <HydrateClient>
      <main className='flex min-h-screen flex-col'>
        <div className='flex flex-col items-center justify-center gap-10 py-10'>
          <ThemeToggle />
          <UserButton user={session?.user} />
          <p className='font-bold text-xl'>{t('title')}</p>
          <LanguageToggle />
        </div>

        <div className='flex min-h-screen flex-col'>
          <section className='relative overflow-hidden px-4 py-20 md:px-6 md:py-28 lg:px-8'>
            <div className='container relative z-10 mx-auto'>
              <div className='flex flex-col items-center space-y-8 text-center'>
                <MotionDiv
                  animate={{ opacity: 1, y: 0 }}
                  className='flex flex-1 flex-col items-center justify-center px-4 md:px-8'
                  initial={{ opacity: 0, y: 60 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  <div className='mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm'>
                    <span className='flex items-center gap-2'>
                      <HeartPulse className='h-4 w-4' />
                      Caring for Every Child, Every Step
                    </span>
                  </div>
                  <h1 className='font-extrabold text-4xl text-foreground leading-tight tracking-tight md:text-6xl'>
                    Welcome to{' '}
                    <span className='text-primary-500'>
                      {siteMetadata.name}
                    </span>
                    <br />
                    <MotionSpan
                      animate={{ scale: 1, opacity: 1 }}
                      className='mt-3 block text-5xl text-blue-700 md:text-6xl lg:text-7xl'
                      initial={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 1, delay: 0.4, type: 'spring' }}
                    >
                      Modern Pediatric Clinic Management
                    </MotionSpan>
                  </h1>
                  <p className='mt-4 text-gray-700 text-lg leading-relaxed sm:text-xl dark:text-gray-300'>
                    {siteMetadata.description}
                  </p>
                </MotionDiv>

                {/* API Status */}
                <section className='rounded-lg border p-4'>
                  <h2 className='mb-2 font-medium'>API Status</h2>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        healthStatus === null ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                    <span className='text-muted-foreground text-sm'>
                      {healthStatus === null ? 'Disconnected' : 'Connected'}
                    </span>
                  </div>
                </section>

                {/* Action Buttons */}
                <MotionDiv
                  animate={{ opacity: 1, y: 0 }}
                  className='mt-8 flex flex-col gap-4 sm:flex-row'
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {session?.user ? (
                    <Link href={`/${session.user.role}`}>
                      <Button
                        className='w-full rounded-full bg-primary-600 px-8 py-3 font-semibold text-lg text-white shadow-md transition-all hover:scale-105 hover:bg-primary-700 hover:shadow-lg sm:w-auto'
                        size='lg'
                      >
                        <span className='flex items-center'>
                          Go to Dashboard
                          <ArrowRight className='ml-2 h-5 w-5' />
                        </span>
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href='/signin'>
                        <Button
                          className='w-full rounded-full bg-primary-600 px-8 py-3 font-semibold text-lg text-white shadow-md transition-all hover:scale-105 hover:bg-primary-700 hover:shadow-lg sm:w-auto'
                          size='lg'
                        >
                          <span className='flex items-center'>
                            Log In to Patient Portal
                            <ArrowRight className='ml-2 h-5 w-5' />
                          </span>
                        </Button>
                      </Link>
                      <Link href='/signup'>
                        <Button
                          className='w-full rounded-full border-primary-600 px-8 py-3 font-semibold text-lg text-primary-600 shadow-md transition-all hover:scale-105 hover:bg-primary-50 hover:shadow-lg sm:w-auto dark:hover:bg-gray-700'
                          size='lg'
                          variant='outline'
                        >
                          New Patient Registration
                        </Button>
                      </Link>
                    </>
                  )}
                </MotionDiv>
              </div>
            </div>
          </section>
        </div>
        <FeaturesSection />
        <section className='relative overflow-hidden bg-primary-600 px-4 py-20 text-white md:px-8 lg:px-12'>
          {/* Background Floating Animations for visual interest */}
          <div className='absolute inset-0 overflow-hidden'>
            {/* First animation */}
            <FloatingAnimation
              className='absolute top-1/3 right-1/4 translate-x-1/2 transform'
              delay={0.8} // Slightly delayed for variety
              duration={6} // Longer duration for slower movement
            >
              <div className='h-64 w-64 rounded-full bg-white/10 blur-3xl' />
            </FloatingAnimation>

            {/* Second animation, positioned differently */}
            <FloatingAnimation
              className='-translate-x-1/2 absolute bottom-1/4 left-1/5 transform'
              delay={1.2} // Further delayed
              duration={7} // Even longer duration
            >
              <div className='h-72 w-72 rounded-full bg-white/10 blur-3xl' />
            </FloatingAnimation>
          </div>

          {/* Main content of the CTA, ensuring it's above the animations */}
          <div className='relative z-10 mx-auto max-w-3xl text-center'>
            {/* Heading with animation on view */}
            <motion.h2
              className='font-bold text-3xl md:text-4xl lg:text-5xl' // Increased font size for larger screens
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }} // Animation plays only once when it enters view
            >
              Ready to Prioritize Your Family's Health?
            </motion.h2>

            {/* Paragraph with animation on view */}
            <motion.p
              className='mt-4 text-lg opacity-90 md:text-xl' // Increased font size for larger screens
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }} // Animation plays only once when it enters view
            >
              Book an appointment or contact us today to begin the journey.
            </motion.p>

            {/* Call-to-action buttons */}
            <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              {/* Book Appointment Button */}
              <Button
                asChild
                className='w-full bg-white text-primary-600 shadow-lg transition-all hover:scale-105 hover:bg-gray-100 hover:text-primary-700 sm:w-auto'
                size='lg'
              >
                <Link href={appRoutes.scheduleAppointment}>
                  Book Appointment <CalendarDays className='ml-2 h-4 w-4' />
                </Link>
              </Button>

              {/* Contact Us Button */}
              <Button
                asChild
                className='w-full border-white text-white shadow-lg transition-all hover:scale-105 hover:bg-white hover:text-primary-600 sm:w-auto'
                size='lg'
                variant='outline'
              >
                <Link href='/contact'>
                  Contact Us <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <Toast />
      </main>
    </HydrateClient>
  )
}
