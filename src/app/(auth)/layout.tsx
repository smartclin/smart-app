import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { auth } from '@/lib/auth'

export default async function AuthenticationLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect('/dashboard')
  }

  return children
}
