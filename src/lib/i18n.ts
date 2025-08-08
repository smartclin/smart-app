import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

import { getUserLocale } from '@/server/locale'

// Can be imported from a shared config
export const locales = ['en', 'ar'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async () => {
  const locale = await getUserLocale()
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound()

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'UTC',
    locale,
    now: new Date(),
  }
})
