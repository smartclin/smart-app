import type { UIMessage as TMessage } from 'ai';

import { useScrollToBottom } from '@/hooks/use-scroll-bottom';

import { Message } from './message';

export const Messages = ({
  messages,
  isLoading,
  status
}: {
  messages: TMessage[];
  isLoading: boolean;
  status: 'error' | 'submitted' | 'streaming' | 'ready';
}) => {
  const [containerRef, endRef] = useScrollToBottom();
  return (
    <div
      className='h-full flex-1 space-y-4 overflow-y-auto py-8'
      ref={containerRef}
    >
      <div className='mx-auto max-w-xl pt-8'>
        {messages.map((m, i) => (
          <Message
            isLatestMessage={i === messages.length - 1}
            isLoading={isLoading}
            key={m.id}
            message={m}
            status={status}
          />
        ))}
        <div
          className='h-1'
          ref={endRef}
        />
      </div>
    </div>
  );
};
