'use client';

import { useChatConversation } from '../hooks/use-chat-conversation';
import { ChatComposer } from './chat-composer';
import { ChatMessageList } from './chat-message-list';

import type { ChatBootstrapData } from '@/lib/contracts/chat';

interface ChatPanelProps {
  readonly bootstrap: ChatBootstrapData;
}

export const ChatPanel = ({ bootstrap }: ChatPanelProps) => {
  const { isLoading, messages, sendMessage } = useChatConversation({
    initialMessages: bootstrap.messages,
    sessionId: bootstrap.session.id,
  });

  return (
    <section
      style={{
        margin: '0 auto',
        maxWidth: 880,
        minHeight: '100dvh',
        padding: '1rem',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: '1rem',
      }}
    >
      <header>
        <h1 style={{ marginBottom: '0.5rem' }}>Copiloto Conversacional</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Sessão {bootstrap.session.id} · operação apenas após validação e confirmação explícita.
        </p>
      </header>

      <ChatMessageList messages={messages} />

      <footer style={{ display: 'grid', gap: '0.5rem' }}>
        <ChatComposer
          disabled={isLoading}
          onSend={async (value) => {
            await sendMessage(value);
          }}
        />
        {isLoading ? <small>Gerando resposta em streaming...</small> : null}
      </footer>
    </section>
  );
};
