import type { Message as DBMessage } from '@prisma/client';
import type { UIMessage } from 'ai';
import { type ClassValue, clsx } from 'clsx';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, toZonedTime } from 'date-fns-tz';
import hljs from 'highlight.js';
import { twMerge } from 'tailwind-merge';
import type { Node } from 'unist'; // FIX: Import Node type from unist
import { visit } from 'unist-util-visit';

import type { Tool } from './tools/tool';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function range(start: number, end: number, step = 1) {
  const output: number[] = [];

  for (let i = start; i <= end; i += step) {
    output.push(i);
  }

  return output;
}

export function groupArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getBrowserLocale() {
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages;
  }
  return [navigator.language];
}

export function getPrimaryBrowserLocale() {
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages[0];
  }
  return navigator.language;
}

export function getConferencingProviderId(uri?: string) {
  try {
    if (!uri) {
      return 'none';
    }

    const url = new URL(uri);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('meet.google.com') || hostname.includes('hangouts.google.com')) {
      return 'google';
    }

    if (hostname.includes('zoom.us') || hostname.includes('zoom.com')) {
      return 'zoom';
    }

    return 'none';
  } catch {
    // Fallback to string matching for non-URL strings
    const lowerUri = uri?.toLowerCase();
    if (lowerUri?.includes('google')) return 'google';
    if (lowerUri?.includes('zoom')) return 'zoom';
    return 'none';
  }
}

export const delayHighlighter = () => {
  setTimeout(() => {
    setHighlighter();
  }, 100);
};

const setHighlighter = () => {
  const elements = document.querySelectorAll(`code[class^="language-"]`);
  const filteredElements = Array.from(elements).filter(
    element => !element.hasAttribute('data-highlighted')
  ) as HTMLElement[];
  if (filteredElements) {
    filteredElements.forEach(codeBlock => {
      if (codeBlock.dataset.highlighted !== 'yes') {
        codeBlock.parentElement?.classList.remove('p-3');
        hljs.highlightElement(codeBlock);
      }
    });
  }
};

export const removeJunkStreamData = (data: string) => {
  const cleanedData = data
    .replace(/:\s*OPENROUTER PROCESSING/gi, '') // Why OpenRouter... why?
    .replace(/data:\s*\{\s*"type"\s*:\s*"ping"\s*\}/gi, '') // Anthropic adds this in stream for some reason
    .replace(/data:\s*\[\s*DONE\s*\]/gi, '')
    .replace(/^data:\s*/, '');
  return cleanedData.trimEnd().trimStart();
};

export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const cleanString = (input: string): string => {
  return input
    .replace(/['"!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '')
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const isNullOrWhitespace = (input: string | null | undefined): boolean => {
  return !input?.trim();
};

export const hasNonWhitespaceChars = (str: string | null | undefined): boolean => {
  return !str ? false : /\S/.test(str);
};

export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim() === '';
};

// url: https://stackoverflow.com/a/18650828
export const formatBytes = (a: number, b = 2) => {
  if (!+a) return '0 Bytes';
  const c = 0 > b ? 0 : b;
  const d = Math.floor(Math.log(a) / Math.log(1024));
  return `${Number.parseFloat((a / 1024 ** d).toFixed(c))} ${['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]}`;
};

export const removeClassesByWord = (classes: string, wordToRemove: string): string => {
  const escapedWord = wordToRemove.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const wordRegex = new RegExp(`\\b[\\w-]*${escapedWord}[\\w-]*\\b`, 'g');
  return classes
    .replace(wordRegex, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const removeHttp = (url: string): string => {
  return url.replace(/^(https?:\/\/)/, '');
};

export const formatTime = (ms: number): string => {
  const totalSeconds = ms / 1000;

  if (totalSeconds < 1) {
    return `${ms} ms`;
  }
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes} min ${seconds} s`;
  }
  return `${Math.floor(totalSeconds)} s`;
};
// remarkPlugin for Markdown
export const thinkPlugin = (messageId: string) => {
  return (tree: Node) => {
    visit(tree, (node: Node) => {
      // FIX: Changed 'tree.type' to 'node.type' in the first condition
      if (
        node.type === 'html' &&
        'value' in node &&
        typeof node.value === 'string' &&
        node.value.includes('<think>')
      ) {
        const thinkId = `think-${messageId}`;

        node.value = `<div>
        <span data-think-id="${thinkId}">Thinking</span>
        <div class="text-stone-300 bg-stone-950 rounded p-3 mb-2 hidden" id="${thinkId}">`;
      }

      if (
        node.type === 'html' &&
        'value' in node &&
        typeof node.value === 'string' &&
        node.value.includes('</think>')
      ) {
        node.value = '</div></div>';
      }
    });
  };
};

export function injectCurrentDate(prompt: string, timezone = 'Asia/Kolkata') {
  const now = new Date();
  const zoned = toZonedTime(now, timezone);

  const formatted = format(zoned, "EEEE, MMMM d, yyyy 'at' h:mm a zzz", {
    timeZone: timezone
  });

  return prompt.replace('{{CURRENT_DATE}}', `${formatted} (${timezone})`);
}

export function extractText(content: unknown): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map(block => {
        if (typeof block === 'string') return block;
        if (block?.text) return block.text;
        if (block?.code) return `\`\`\`\n${block.code}\n\`\`\``;
        if (block?.url) return `[Link](${block.url})`;
        return '';
      })
      .join('\n\n')
      .trim();
  }

  return '';
}

export function convertToAISDKMessages(messages: Array<DBMessage>): UIMessage[] {
  return messages.map(msg => {
    const message: UIMessage = {
      id: msg.id,
      role: msg.role === 'USER' ? 'user' : 'assistant',
      parts: msg.parts as UIMessage['parts']
    };
    return message;
  });
}

export function filterMessageHistory(messages: UIMessage[], activeTool: Tool) {
  if (activeTool === 'none') {
    return messages
      .map(message => {
        if (message.role === 'assistant' && message.parts) {
          const filteredParts = message.parts.filter(part => part.type !== 'tool-invocation');

          return {
            ...message,
            parts: filteredParts
          };
        }
        return message;
      })
      .filter(
        message =>
          (message.parts?.length && message.parts.length > 0) || message.role !== 'assistant'
      );
  }

  return messages;
}

export function getActiveToolNames(tool: Tool): string[] {
  switch (tool) {
    case 'image-gen':
      return ['generateImageTool'];
    case 'web-search':
      return ['webSearchTool'];
    case 'get-weather':
      return ['getWeatherTool'];
    default:
      return [];
  }
}

export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function cleanText(text = ''): string {
  return text
    .replace(/\n+/g, ' ') // Remove excessive newlines
    .replace(/\s+/g, ' ') // Collapse spaces
    .replace(/https?:\/\/\S+/g, '') // Strip URLs
    .trim();
}
