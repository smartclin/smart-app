import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth';
import { trpc } from '@/trpc/server';
import { getUserRole } from '@/utils/roles';

import CallToAction from './_components/CTA';
import { FeaturesSection } from './_components/Features';
import Hero from './_components/Hero';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const userId = session?.user.id;
  const role = userId ? await getUserRole() : null;

  if (userId && role) {
    redirect(`/${role.toLowerCase()}`);
  }

  let apiHealthy = false;
  try {
    apiHealthy = await trpc.healthCheck();
  } catch (e) {
    console.error('API health check failed:', e);
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <Hero siteMetadata={{ name: '', description: '' }} />
      <FeaturesSection />
      <CallToAction />
      {!apiHealthy && (
        <div className='mx-auto mt-4 max-w-md rounded-md border border-red-400 p-4 text-center text-red-600'>
          Warning: API is currently unreachable. Some features may not work.
        </div>
      )}
    </div>
  );
}
