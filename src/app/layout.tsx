import type { Metadata } from 'next';

import '../styles/globals.css';
import '../styles/theme.css';

import Providers from '@/components/providers';
import { geistMono, geistSans } from '@/styles/fonts';
import { TRPCProvider } from '@/trpc/client';

export const metadata: Metadata = {
  title: 'smart-clinic',
  description: 'smart-clinic'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCProvider>
          <Providers>
            <div className='grid h-svh grid-rows-[auto_1fr]'>
              <Header />
              {children}
            </div>
          </Providers>
        </TRPCProvider>
      </body>
    </html>
  );
}
