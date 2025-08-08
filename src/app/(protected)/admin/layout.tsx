import { Edit, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/server'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession()

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  // Redirect if user is signed in but not an admin
  if (session.user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 w-full border-b backdrop-blur'>
        <div className='container flex h-14 items-center'>
          <div className='mr-4 flex'>
            <Link href='/admin'>
              <h1 className='font-semibold text-lg'>Admin Dashboard</h1>
            </Link>
          </div>
          <nav className='flex items-center space-x-4 lg:space-x-6'>
            <AdminNavLink href='/admin/posts'>
              <FileText className='mr-2 h-4 w-4' />
              Posts
            </AdminNavLink>
            <AdminNavLink href='/admin/editor'>
              <Edit className='mr-2 h-4 w-4' />
              Editor
            </AdminNavLink>
          </nav>
          <div className='ml-auto flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              {session.user.image && (
                <Image
                  alt={session.user.name ?? 'User'}
                  className='h-8 w-8 rounded-full'
                  height={64}
                  src={session.user.image}
                  width={64}
                />
              )}
            </div>
          </div>
        </div>
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  )
}

interface AdminNavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

function AdminNavLink({ href, children, className }: AdminNavLinkProps) {
  return (
    <Link
      className={cn(
        'flex items-center font-medium text-muted-foreground text-sm transition-colors hover:text-primary',
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  )
}
