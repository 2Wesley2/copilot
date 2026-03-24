import type { SendChatMessageInput } from '@/lib/contracts/chat';
import { createChatService } from '@/services/chat/chat-service.factory';

const encoder = new TextEncoder();

const isSendChatMessageInput = (value: unknown): value is SendChatMessageInput => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('sessionId' in value) || !('message' in value)) {
    return false;
  }

  return typeof value.sessionId === 'string' && typeof value.message === 'string';
};

export const POST = async (request: Request): Promise<Response> => {
  const payload: unknown = await request.json();

  if (!isSendChatMessageInput(payload)) {
    return new Response('Invalid payload', { status: 400 });
  }

  const chatService = createChatService();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of chatService.streamMessage(payload)) {
        controller.enqueue(encoder.encode(chunk));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
};
