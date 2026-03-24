import type { ChatMessage } from '@/lib/contracts/chat';

export const sortMessagesByDate = (messages: readonly ChatMessage[]): ChatMessage[] =>
  [...messages].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
