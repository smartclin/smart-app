import type { Metadata } from 'next'

import '../styles/globals.css'

import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server' // Import getMessages

import Providers from '@/components/providers' // This should wrap your entire app
import { ThemeProvider } from '@/components/theme/provider'
import { ThemeToastContainer } from '@/components/theme/toast-container'
import { TopLoader } from '@/components/top-loader'
import { cn } from '@/lib/utils'
import { geistMono, geistSans } from '@/styles/fonts'
import { TRPCReactProvider } from '@/trpc/client'

export const metadata: Metadata = {
  title: 'smart-clinic',
  description: 'smart-clinic',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  // Fetch messages for the current locale
  // This is crucial for NextIntlClientProvider
  const messages = await getMessages()

  return (
    <html
      className={cn(geistSans.variable, geistMono.variable, 'antialiased')}
      lang={locale}
      // cn utility should take arguments as separate strings
      suppressHydrationWarning
    >
      <body>
        {/*
          Providers component should ideally wrap the entire application,
          including TRPCReactProvider and NextIntlClientProvider,
          as it often aggregates various context providers.
          Ensure your Providers component correctly renders its children.
        */}
        <Providers>
          {/* NextIntlClientProvider must receive the messages prop */}
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
          >
            {/* TRPCReactProvider is typically higher in the tree */}
            <TRPCReactProvider>
              <ThemeProvider
                attribute='class'
                defaultTheme='system'
                disableTransitionOnChange
                enableSystem
              >
                <TopLoader />
                <ThemeToastContainer />
                {children}
              </ThemeProvider>
            </TRPCReactProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}
