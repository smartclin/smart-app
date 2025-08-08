import Link from 'next/link'

export const DeployButton = () => (
  <Link
    className='ml-2 inline-flex items-center gap-2 rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100'
    href={
      'https://vercel.com/new/clone?project-name=Vercel+x+xAI+Chatbot&repository-name=ai-sdk-starter-xai&repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-starter-xai&demo-title=Vercel+x+xAI+Chatbot&demo-url=https%3A%2F%2Fai-sdk-starter-xai.labs.vercel.dev%2F&demo-description=A+simple+chatbot+application+built+with+Next.js+that+uses+xAI+via+the+AI+SDK+and+the+Vercel+Marketplace&products=%5B%7B%22type%22:%22integration%22,%22protocol%22:%22ai%22,%22productSlug%22:%22grok%22,%22integrationSlug%22:%22xai%22%7D%5D'
    }
    rel='noopener noreferrer'
    target='_blank'
  >
    <svg
      data-testid='geist-icon'
      height={14}
      strokeLinejoin='round'
      style={{ color: 'currentcolor' }}
      viewBox='0 0 16 16'
      width={14}
    >
      <title>Path</title>
      <path
        clipRule='evenodd'
        d='M8 1L16 15H0L8 1Z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </svg>
    Deploy
  </Link>
)
