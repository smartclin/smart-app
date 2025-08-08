'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

import FloatingAnimation from '@/components/floating-animation';
import { Button } from '@/components/ui/button';
import { appRoutes } from '@/config'; // Ensure appRoutes is correctly configured

export default function CallToAction() {
  return (
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
  );
}
