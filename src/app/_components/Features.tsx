'use client'

import { motion } from 'framer-motion'
import {
  Baby,
  CalendarDays,
  ClipboardCheck,
  HeartHandshake,
  Salad,
  Shield,
  Stethoscope,
  Syringe,
  UserPlus,
  Wallet,
} from 'lucide-react'
import Image from 'next/image'

import FloatingAnimation from '@/components/floating-animation'

const clinicFeatures = [
  {
    title: 'Secure Patient Records',
    description:
      'Ensure the highest level of privacy and security for all patient data, compliant with health regulations.',
    icon: Shield,
  },
  {
    title: 'Effortless Appointments',
    description:
      'Manage bookings, send automated reminders, and integrate with calendars for seamless scheduling.',
    icon: CalendarDays,
  },
  {
    title: 'Streamlined Registration',
    description:
      'Simplify patient intake with easy-to-use forms and quick record creation.',
    icon: UserPlus,
  },
  {
    title: 'Comprehensive Vaccinations',
    description:
      'Track and manage vaccination schedules effortlessly, ensuring timely immunizations.',
    icon: Syringe,
  },
  {
    title: 'Integrated Billing & Payments',
    description:
      'Handle all financial transactions, insurance claims, and billing with clarity and ease.',
    icon: Wallet,
  },
  {
    title: 'Routine Checkup',
    description:
      'Comprehensive well-baby and child exams to monitor growth, health, and early signs of illness.',
    icon: Stethoscope,
  },
  {
    title: 'Medical Examination',
    description:
      'Focused evaluations for acute concerns, sick visits, and follow-ups with thorough documentation.',
    icon: ClipboardCheck,
  },
  {
    title: 'Vaccination Services',
    description:
      'Administering essential and elective vaccines according to international and local immunization schedules.',
    icon: Syringe,
  },
  {
    title: 'Nutritional Assessment',
    description:
      'Dietary evaluation and tailored advice to support healthy weight, growth, and nutritional needs.',
    icon: Salad,
  },
  {
    title: 'Developmental Tracking',
    description:
      'Monitoring milestones in motor, cognitive, language, and social-emotional development.',
    icon: Baby,
  },
  {
    title: 'Health Counseling',
    description:
      'Guidance for parents on sleep, behavior, safety, and preventive pediatric care.',
    icon: HeartHandshake,
  },
]

export function FeaturesSection() {
  return (
    <>
      {/* Image preview section */}
      <section className='flex justify-center px-4 pt-20'>
        <motion.div
          className='w-full max-w-5xl overflow-hidden rounded-xl border border-border shadow-lg'
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className='relative'>
            <div className='absolute top-0 left-0 flex h-8 w-full items-center border-border border-b bg-muted px-4'>
              <div className='flex space-x-2'>
                <div className='h-3 w-3 rounded-full bg-red-400' />
                <div className='h-3 w-3 rounded-full bg-yellow-400' />
                <div className='h-3 w-3 rounded-full bg-green-400' />
              </div>
            </div>
            <div className='bg-card p-4 pt-8'>
              <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 shadow-inner dark:border-gray-700'>
                <Image
                  alt='Smart Clinic interior showing modern and welcoming design'
                  className='rounded-lg object-cover'
                  fill
                  sizes='(max-width: 768px) 100vw, 800px'
                  src='/images/clinic-interior-hero.jpg'
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className='relative bg-gray-50 px-4 py-20 md:px-6 lg:px-8 dark:bg-gray-900'>
        <div className='absolute inset-0 overflow-hidden'>
          <FloatingAnimation
            className='-translate-x-1/2 absolute bottom-1/4 left-1/3 transform'
            delay={0.8}
            duration={6}
          >
            <div className='h-72 w-72 rounded-full bg-primary/5 blur-3xl' />
          </FloatingAnimation>
        </div>

        <div className='container relative mx-auto'>
          <div className='mb-16 text-center'>
            <motion.h2
              className='mb-4 font-bold text-3xl text-foreground md:text-4xl'
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              Comprehensive Care & Management Features
            </motion.h2>
            <motion.p
              className='mx-auto max-w-2xl text-muted-foreground text-xl'
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              Everything your family needs for a healthier future—streamlined by
              smart clinic technology.
            </motion.p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {clinicFeatures.map((feature, index) => (
              <motion.div
                className='flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                key={feature.title}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  transition: { duration: 0.2 },
                }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className='mb-4 w-fit rounded-full bg-primary/10 p-3'>
                  <feature.icon className='h-6 w-6 text-primary' />
                </div>
                <h3 className='mb-2 font-bold text-xl'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
