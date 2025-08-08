import { v4 as uuidv4 } from 'uuid';

import ChatView from '@/components/chat/ChatView';
import { getChatModelFromCookies } from '@/lib/model';
import { getToolFromCookies } from '@/lib/tools';

export default async function ChatPage() {
  const chatId = uuidv4();
  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

  return (
    <ChatView
      chatId={chatId}
      initialMessages={[]}
      selectedModel={selectedModel}
      selectedTool={selectedTool}
    />
  );
}
