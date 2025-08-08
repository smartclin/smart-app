'use server'

import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'

import { auth } from './index'

export const getServerSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export const getSession = getServerSession
