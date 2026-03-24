import type {
  ChatBootstrapData,
  ChatMessage,
  SendChatMessageInput,
  SendChatMessageResult,
} from '@/lib/contracts/chat';
import { sleep } from '@/lib/utils/sleep';
import type { ChatService } from '@/services/chat/chat-service.contract';

const sessionId = 'session-demo-001';

const nowIso = () => new Date().toISOString();

const initialMessages: readonly ChatMessage[] = [
  {
    id: 'msg-001',
    sessionId,
    role: 'SYSTEM',
    content:
      'Fluxo seguro habilitado: toda operação exige interpretação, draft validável e confirmação explícita.',
    streamed: false,
    createdAt: nowIso(),
  },
  {
    id: 'msg-002',
    sessionId,
    role: 'ASSISTANT',
    content:
      'Olá! Descreva a intenção da operação e eu vou propor um draft para revisão antes de qualquer execução.',
    streamed: false,
    createdAt: nowIso(),
  },
];

export class MockChatService implements ChatService {
  public getBootstrapData(): Promise<ChatBootstrapData> {
    return Promise.resolve({
      session: {
        id: sessionId,
        actorId: 'actor-frontend-poc',
        status: 'ACTIVE',
        createdAt: nowIso(),
      },
      messages: initialMessages,
    });
  }

  public async sendMessage(input: SendChatMessageInput): Promise<SendChatMessageResult> {
    await sleep(200);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      role: 'USER',
      content: input.message,
      streamed: false,
      createdAt: nowIso(),
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      role: 'ASSISTANT',
      content:
        'Interpretação concluída. Estruturei um draft inicial e sinalizei validações pendentes. Aguardo sua revisão explícita para avançar.',
      streamed: true,
      createdAt: nowIso(),
    };

    return {
      userMessage,
      assistantMessage,
      draft: {
        operationIntent: 'UPDATE',
        rationale: 'A proposta prioriza rastreabilidade e evita execução implícita.',
        requiresExplicitConfirmation: true,
        nextStep: 'VALIDATE_DRAFT',
      },
    };
  }

  public async *streamMessage(input: SendChatMessageInput): AsyncGenerator<string, void, undefined> {
    const streamChunks = [
      `Recebi sua solicitação: "${input.message}". `,
      'Interpretei a intenção e estruturei um draft preliminar. ',
      'Agora vou apresentar os dados para validação antes de qualquer confirmação final.',
    ];

    for (const chunk of streamChunks) {
      await sleep(300);
      yield chunk;
    }
  }
}
