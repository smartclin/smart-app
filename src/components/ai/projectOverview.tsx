import NextLink from 'next/link';
export const ProjectOverview = () => {
  return (
    <div className='flex flex-col items-center justify-end'>
      <h1 className='mb-4 font-semibold text-3xl'>
        Vercel <span className='text-zinc-500'>+</span> xAI Chatbot
      </h1>
      <p className='text-center'>
        This starter project uses <Link href='https://x.ai'>xAI</Link> with the{' '}
        <Link href='https://sdk.vercel.ai/docs'>AI SDK</Link> via the{' '}
        <Link href='https://vercel.com/marketplace/xai'>Vercel Marketplace</Link>.
      </p>
    </div>
  );
};

const Link = ({ children, href }: { children: React.ReactNode; href: string }) => {
  return (
    <NextLink
      className='text-blue-500 transition-colors duration-75 hover:text-blue-600'
      href={href}
      target='_blank'
    >
      {children}
    </NextLink>
  );
};
