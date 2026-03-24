import type {
  ChatBootstrapData,
  SendChatMessageInput,
  SendChatMessageResult,
} from '@/lib/contracts/chat';

export interface ChatService {
  getBootstrapData(): Promise<ChatBootstrapData>;
  sendMessage(input: SendChatMessageInput): Promise<SendChatMessageResult>;
  streamMessage(input: SendChatMessageInput): AsyncGenerator<string, void, undefined>;
}
