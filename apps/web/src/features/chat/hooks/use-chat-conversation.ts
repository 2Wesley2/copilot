'use client';

import { useMemo, useState } from 'react';

import { sortMessagesByDate } from '@/features/chat/model/chat-presenter';
import type { ChatMessage } from '@/lib/contracts/chat';

interface UseChatConversationInput {
  readonly initialMessages: readonly ChatMessage[];
  readonly sessionId: string;
}

interface SendMessageResult {
  readonly ok: true;
}

export const useChatConversation = ({
  initialMessages,
  sessionId,
}: UseChatConversationInput): {
  readonly isLoading: boolean;
  readonly messages: readonly ChatMessage[];
  readonly sendMessage: (value: string) => Promise<SendMessageResult>;
} => {
  const [messages, setMessages] = useState<readonly ChatMessage[]>(sortMessagesByDate(initialMessages));
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (value: string): Promise<SendMessageResult> => {
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: 'USER',
      content: value,
      streamed: false,
      createdAt: new Date().toISOString(),
    };

    const assistantDraftId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantDraftId,
        sessionId,
        role: 'ASSISTANT',
        content: '',
        streamed: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message: value,
      }),
    });

    if (!response.ok || response.body === null) {
      setIsLoading(false);
      throw new Error('Falha ao iniciar stream de resposta.');
    }

    const reader = response.body.getReader();

    const decoder = new TextDecoder();
    let streamingContent = '';
    let isStreaming = true;

    while (isStreaming) {
      const chunk = await reader.read();

      if (chunk.done) {
        isStreaming = false;
        continue;
      }

      streamingContent += decoder.decode(chunk.value, { stream: true });
      setMessages((current) =>
        current.map((message) => {
          if (message.id !== assistantDraftId) {
            return message;
          }

          return {
            ...message,
            content: streamingContent,
          };
        }),
      );
    }

    setIsLoading(false);
    return { ok: true };
  };

  return {
    isLoading,
    messages: useMemo(() => sortMessagesByDate(messages), [messages]),
    sendMessage,
  };
};
