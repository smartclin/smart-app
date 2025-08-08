'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useEffect, useRef } from 'react';

export type DataPart = { type: 'append-message'; message: string };

interface Props {
  autoResume: boolean;
  initialMessages: UIMessage[];
  experimental_resume: UseChatHelpers<UIMessage>['resumeStream'];
  data: DataPart[];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  experimental_resume,
  data,
  setMessages
}: Props) {
  const hasResumed = useRef(false);
  const processedDataIds = useRef(new Set<string>());

  useEffect(() => {
    if (!autoResume || hasResumed.current) return;

    const mostRecentMessage = initialMessages.at(-1);
    if (mostRecentMessage?.role === 'user') {
      hasResumed.current = true;

      const timer = setTimeout(() => {
        try {
          experimental_resume();
        } catch (error) {
          console.error('Error resuming stream:', error);
          hasResumed.current = false;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoResume, experimental_resume, initialMessages]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    try {
      data.forEach((item: DataPart, index: number) => {
        const dataId = `${index}-${JSON.stringify(item)}`;

        if (processedDataIds.current.has(dataId)) return;

        if (item.type === 'append-message') {
          const message = JSON.parse(item.message) as UIMessage;

          const messageExists = initialMessages.some(m => m.id === message.id);

          if (!messageExists) {
            setMessages([...initialMessages, message]);
          }

          processedDataIds.current.add(dataId);
        }
      });
    } catch (error) {
      console.error('Error processing resume data:', error);
    }
  }, [data, initialMessages, setMessages]);

  useEffect(() => {
    return () => {
      hasResumed.current = false;
      processedDataIds.current.clear();
    };
  }, []);
}
