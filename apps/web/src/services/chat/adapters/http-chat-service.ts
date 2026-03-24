import type {
  ChatBootstrapData,
  SendChatMessageInput,
  SendChatMessageResult,
} from '@/lib/contracts/chat';
import type { ChatService } from '@/services/chat/chat-service.contract';

export class HttpChatService implements ChatService {
  public getBootstrapData(): Promise<ChatBootstrapData> {
    return Promise.reject(
      new Error('HTTP adapter ainda não implementado. Substituir mock por endpoint real aqui.'),
    );
  }

  public sendMessage(_input: SendChatMessageInput): Promise<SendChatMessageResult> {
    return Promise.reject(new Error('HTTP adapter ainda não implementado.'));
  }

  public async *streamMessage(_input: SendChatMessageInput): AsyncGenerator<string, void, undefined> {
    await Promise.resolve();

    if (Date.now() < 0) {
      yield '';
    }

    throw new Error('HTTP adapter ainda não implementado.');
  }
}
