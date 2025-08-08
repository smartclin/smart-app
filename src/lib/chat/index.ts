'use server';

import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

import { db } from '@/db';

export async function getChatById(chatId: string) {
  const existingChat = await db.chat.findUnique({
    where: {
      id: chatId
    }
  });

  return existingChat;
}

export async function getMessagesByChatId(chatId: string) {
  const existingChat = await db.chat.findUnique({
    where: {
      id: chatId
    }
  });

  if (!existingChat) return [];

  const messages = await db.message.findMany({
    where: {
      chatId
    },
    orderBy: [{ createdAt: 'asc' }]
  });

  return messages;
}

export async function generateTitleFromUserMessage(message: string) {
  const { text: title } = await generateText({
    model: groq('llama3-70b-8192'),
    prompt: message,
    system: `
You are a helpful assistant that summarizes the user's first message into a short, clear title.

Guidelines:
- The title should summarize the message's intent or topic.
- Limit to 4 words or fewer.
- Keep it under 50 characters.
- Do not use quotation marks, colons, or the word "title".
- Return only the title text, nothing else.
    `
  });

  return title.trim();
}

/*for resumable streams*/
export const loadStreams = async (chatId: string) => {
  try {
    const streams = await db.stream.findMany({
      where: {
        chatId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return streams.map(stream => stream.id);
  } catch (error) {
    throw new Error(`Failed to load streamIds: ${(error as Error).message}`);
  }
};

export const appendStreamId = async ({
  chatId,
  streamId
}: {
  chatId: string;
  streamId: string;
}) => {
  try {
    await db.stream.create({
      data: {
        id: streamId,
        chatId,
        createdAt: new Date()
      }
    });
  } catch (error) {
    throw new Error(`Failed to append streamId: ${(error as Error).message}`);
  }
};
