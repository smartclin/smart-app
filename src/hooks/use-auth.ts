// src/lib/auth/use-auth.ts
import { useCallback, useEffect, useState } from 'react'

import { useSession } from '@/lib/auth/auth-client'
import { getSession } from '@/lib/auth/server'
import type { UserRole } from '@/lib/routes'

import type { Session, User } from '../lib/auth'

export interface AuthUser {
  twoFactorEnabled: boolean | null
  session: Session | null
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null
  firstName?: string | null
  lastName?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Normalize raw user data from the session.
 */
function normalizeUser(user: unknown): AuthUser {
  const u = user as Partial<AuthUser> & {
    id: string
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
  }

  return {
    image: u.image ?? null,
    role: u.role ?? null,
    banned: u.banned ?? null,
    banReason: u.banReason ?? null,
    banExpires: u.banExpires ?? null,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
    id: '',
    session: null,
    twoFactorEnabled: false,
    name: '',
    email: '',
    emailVerified: false,
  }
}

/**
 * Custom hook to manage and expose user session state.
 */
export function useAuth() {
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      const session: Session | null = await getSession()
      if (session?.user) {
        setUser(normalizeUser(session.user))
        setStatus('authenticated')
        setError(null)
      } else {
        setUser(null)
        setStatus('unauthenticated')
        setError(null)
      }
    } catch (err) {
      console.error('Failed to retrieve session:', err)
      setUser(null)
      setStatus('unauthenticated')
      setError(
        err instanceof Error
          ? err
          : new Error('Unknown error during authentication.'),
      )
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return { user, status, error }
}

/**
 * Hook to expose simplified auth data for UI components.
 */
export function useUser() {
  const { user, status, error } = useAuth()

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    error,
  }
}

export function useCurrentUser(): User | null {
  const { data: session } = useSession()

  if (!session?.user) return null

  // Map better-auth user to our User type
  const betterAuthUser = session.user
  return {
    id: betterAuthUser.id,
    email: betterAuthUser.email,
    name: betterAuthUser.name,
    role: (betterAuthUser.role as UserRole) || UserRole.DOCTOR,
    isEmailVerified: betterAuthUser.emailVerified,
    createdAt: betterAuthUser.createdAt,
    updatedAt: betterAuthUser.updatedAt,
    avatar: betterAuthUser.image || undefined,
  } as User
}

// Hook para verificar roles
export function useUserRole() {
  const user = useCurrentUser()

  return {
    user,
    isPatient: user?.role === UserRole.PATIENT,
    isDoctor: user?.role === UserRole.DOCTOR,
    isAdmin: user?.role === UserRole.ADMIN,
    isStaff: user?.role === UserRole.STAFF,
    isAuthenticated: !!user,
  }
}
