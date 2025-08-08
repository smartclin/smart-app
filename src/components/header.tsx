'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ModeToggle } from './theme/mode-toggle'
import UserMenu from './user-menu'

export default function Header() {
  const pathname = usePathname()

  // You can enhance this logic to use session.user.role if needed
  let role: 'admin' | 'doctor' | 'patient' | 'public' = 'public'
  if (pathname.startsWith('/admin')) role = 'admin'
  else if (pathname.startsWith('/doctor')) role = 'doctor'
  else if (pathname.startsWith('/patient')) role = 'patient'

  const navLinks: Record<typeof role, { to: string; label: string }[]> = {
    public: [
      { to: '/', label: 'Home' },
      { to: '/signin', label: 'Sign In' },
      { to: '/signup', label: 'Sign Up' },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/posts', label: 'Posts' },
      { to: '/admin/system-settings', label: 'Settings' },
      { to: '/record/users', label: 'Users' },
    ],
    doctor: [
      { to: '/doctor', label: 'Dashboard' },
      { to: '/record/patients', label: 'Patients' },
      { to: '/record/appointments', label: 'Appointments' },
      { to: '/record/medical-records', label: 'Records' },
    ],
    patient: [
      { to: '/patient', label: 'My Profile' },
      { to: '/patient/registration', label: 'Registration' },
      { to: '/patient/appointments', label: 'Appointments' },
    ],
  }

  const links = navLinks[role]

  return (
    <header>
      <div className='flex flex-row items-center justify-between border-b px-4 py-2'>
        <nav className='flex gap-6 font-medium text-lg'>
          {links.map(({ to, label }) => (
            <Link
              className='hover:underline'
              href={to}
              key={to}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className='flex items-center gap-3'>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
