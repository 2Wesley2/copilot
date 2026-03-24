import { MockChatService } from '@/services/chat/adapters/mock-chat-service';
import type { ChatService } from '@/services/chat/chat-service.contract';

export type ChatDataSource = 'mock' | 'http';

export const createChatService = (dataSource: ChatDataSource = 'mock'): ChatService => {
  if (dataSource === 'http') {
    // Ponto de troca futuro: alternar para HttpChatService ao integrar API real.
    // return new HttpChatService();
  }

  return new MockChatService();
};
