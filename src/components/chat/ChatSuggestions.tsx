'use client';

import type React from 'react';

import { suggestions } from '@/config';

import { Button } from '../ui/button';

interface Props {
  setSuggestions: (suggestion: string) => void;
}

interface BlockProps {
  title: string;
  description: string;
  icon: React.ElementType<{ className?: string }>;
  tag: string;
  setSuggestions: (suggestion: string) => void;
}

const Block = ({ title, icon: Icon, tag, setSuggestions }: BlockProps) => {
  return (
    <Button
      className='w-full justify-center gap-2 rounded-full dark:bg-transparent dark:hover:bg-muted-foreground/5'
      onClick={() => setSuggestions(title)}
      size='sm'
      variant='outline'
    >
      {<Icon className='size-4' />}
      <div className='flex flex-col items-start overflow-hidden'>
        <span className='inline text-sm'>{tag}</span>
      </div>
    </Button>
  );
};

const ChatSuggestions = ({ setSuggestions }: Props) => {
  return (
    <div className='flex items-center justify-center'>
      <ul className='mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {suggestions.map(suggestion => (
          <li
            className='flex flex-col items-center justify-center'
            key={suggestion.title}
          >
            <Block
              {...suggestion}
              setSuggestions={setSuggestions}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSuggestions;
