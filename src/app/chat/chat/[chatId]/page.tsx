import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { validate as uuidValidate } from 'uuid';

import ChatView from '@/components/chat/ChatView';
import { auth } from '@/lib/auth';
import { getChatById, getMessagesByChatId } from '@/lib/chat';
import { getChatModelFromCookies } from '@/lib/model';
import { getToolFromCookies } from '@/lib/tools';
import { convertToAISDKMessages } from '@/lib/utils';

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;

  if (!uuidValidate(chatId)) return redirect('/');

  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

  const messages = await getMessagesByChatId(chatId);
  const initialMessages = convertToAISDKMessages(messages);

  const session = await auth.api.getSession({
    headers: await headers()
  });

  const chat = await getChatById(chatId);

  if (initialMessages.length >= 2 && session?.user.id !== chat?.userId) {
    redirect('/');
  }

  return (
    <ChatView
      chatId={chatId}
      initialMessages={initialMessages}
      selectedModel={selectedModel}
      selectedTool={selectedTool}
    />
  );
}
