import { createChatService } from '@/services/chat/chat-service.factory';

// ISR intencional: página informativa com revalidação periódica e baixo custo de atualização.
export const revalidate = 300;

const ChatCapabilitiesPage = async () => {
  const chatService = createChatService();
  const bootstrap = await chatService.getBootstrapData();

  return (
    <main style={{ margin: '0 auto', maxWidth: 900, padding: '2rem 1rem' }}>
      <h1>Capacidades da conversa</h1>
      <ul>
        <li>Sessão ativa: {bootstrap.session.id}</li>
        <li>Mensagens iniciais: {bootstrap.messages.length}</li>
        <li>Fluxo exige draft e confirmação explícita</li>
      </ul>
    </main>
  );
};

export default ChatCapabilitiesPage;
