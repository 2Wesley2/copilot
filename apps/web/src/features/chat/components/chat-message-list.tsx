import type { ChatMessage } from '@/lib/contracts/chat';

interface ChatMessageListProps {
  readonly messages: readonly ChatMessage[];
}

export const ChatMessageList = ({ messages }: ChatMessageListProps) => (
  <div style={{ display: 'grid', gap: '0.75rem' }}>
    {messages.map((message) => (
      <article
        key={message.id}
        style={{
          border: '1px solid #1f2937',
          borderRadius: 12,
          background: message.role === 'USER' ? '#0f172a' : '#111827',
          padding: '0.75rem',
        }}
      >
        <header style={{ fontSize: '0.75rem', opacity: 0.75 }}>{message.role}</header>
        <p style={{ marginBottom: 0, marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{message.content}</p>
      </article>
    ))}
  </div>
);
