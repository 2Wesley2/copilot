import { ChatPanel } from '@/features/chat/components/chat-panel';
import { createChatService } from '@/services/chat/chat-service.factory';

// SSR intencional: o bootstrap da conversa é resolvido por request para refletir contexto atual.
export const dynamic = 'force-dynamic';

const HomePage = async () => {
  const chatService = createChatService();
  const bootstrap = await chatService.getBootstrapData();

  return <ChatPanel bootstrap={bootstrap} />;
};

export default HomePage;
