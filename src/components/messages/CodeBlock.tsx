/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Button } from '../ui/button';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  inline?: boolean;
}

const CodeBlock = ({ className = '', children, inline }: CodeBlockProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const match = /language-(\w+)/.exec(className);
  const lang = match?.[1] ?? 'text';
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(String(children)).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <pre className='inline w-fit rounded bg-muted-foreground/10 px-1.5 py-0.5 font-mono text-foreground text-xs sm:text-sm'>
        {children}
      </pre>
    );
  }

  return (
    <div className='not-prose my-4 w-full overflow-hidden rounded-lg border shadow-xs dark:shadow-none'>
      <div className='flex items-center justify-between rounded-t-md border-muted-foreground/10 border-b bg-muted px-4 py-1 text-muted-foreground text-xs'>
        <span className='font-medium text-sm'>{lang}</span>
        <Button
          onClick={onCopy}
          size='icon'
          variant='ghost'
        >
          {copied ? <Check /> : <Copy />}{' '}
        </Button>
      </div>
      <div className='overflow-x-auto font-[--font-geist-mono] text-xs md:text-sm'>
        <SyntaxHighlighter
          codeTagProps={{
            style: {
              whiteSpace: 'pre',
              fontFamily: 'inherit'
            }
          }}
          customStyle={{
            margin: 0,
            whiteSpace: 'pre',
            fontFamily: 'var(--font-geist-mono), monospace'
          }}
          language={lang}
          showLineNumbers={lang !== 'plaintext'}
          style={isLight ? materialLight : materialDark}
          wrapLines={false}
          wrapLongLines={false}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
