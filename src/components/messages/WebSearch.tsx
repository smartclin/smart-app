'use client';

import { motion } from 'framer-motion';
import { ArrowUpRightIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

interface WebSearchCardProps {
  results: WebSearchResult[];
  query: string;
}

const WebSearchCard = ({ results, query }: WebSearchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div className='mb-10 min-h-[20px] w-full rounded-none bg-transparent pl-0 transition'>
      <div className='px-0'>
        <div className='flex items-center font-medium text-base'>Web Search Results</div>
        <div className='text-sm'>
          <Button
            className='h-auto w-fit rounded-sm py-1 pl-0 text-muted-foreground text-sm hover:bg-transparent hover:text-foreground dark:hover:bg-transparent'
            onClick={() => setIsExpanded(!isExpanded)}
            size='icon'
            variant='ghost'
          >
            <ChevronRight
              className={cn(
                'size-4 transition-transform duration-200 ease-in-out',
                isExpanded && 'rotate-90'
              )}
            />
            <span className='max-w-xs text-xs sm:text-sm'>Results for {query}</span>
          </Button>
        </div>
      </div>
      {isExpanded && (
        <motion.div
          animate={{
            height: 'auto',
            opacity: 1,
            filter: 'blur(0px)'
          }}
          initial={{
            height: 0,
            opacity: 0,
            filter: 'blur(4px)'
          }}
          style={{ overflow: 'hidden' }}
          transition={{
            height: {
              duration: 0.2,
              ease: [0.04, 0.62, 0.23, 0.98]
            },
            opacity: {
              duration: 0.25,
              ease: 'easeInOut'
            },
            filter: {
              duration: 0.2,
              ease: 'easeInOut'
            }
          }}
        >
          <div className='mt-4 flex flex-col gap-4 px-2'>
            {results.map(result => (
              <Link
                href={`${result.url}`}
                key={result.title}
                target='_blank'
              >
                <div className='flex items-start justify-between'>
                  <h4 className='line-clamp-1 flex-1 font-medium text-sm'>{result.title}</h4>
                  <ArrowUpRightIcon className='size-4 text-muted-foreground' />
                </div>

                <div className='mt-1 flex items-center text-muted-foreground text-xs'>
                  <span className='truncate'>{new URL(result.url).hostname}</span>{' '}
                  <span className='mx-1'>|</span>{' '}
                  {result.publishedDate && (
                    <span>{new Date(result.publishedDate).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WebSearchCard;
