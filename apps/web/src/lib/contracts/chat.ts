export type ChatMessageRole = 'SYSTEM' | 'USER' | 'ASSISTANT';

export interface ChatMessage {
  readonly id: string;
  readonly sessionId: string;
  readonly role: ChatMessageRole;
  readonly content: string;
  readonly streamed: boolean;
  readonly createdAt: string;
}

export interface ChatSessionSummary {
  readonly id: string;
  readonly actorId: string;
  readonly status: 'ACTIVE' | 'PENDING_REVIEW';
  readonly createdAt: string;
}

export interface SendChatMessageInput {
  readonly sessionId: string;
  readonly message: string;
}

export interface SendChatMessageDraft {
  readonly operationIntent: 'CREATE' | 'UPDATE' | 'DELETE';
  readonly rationale: string;
  readonly requiresExplicitConfirmation: true;
  readonly nextStep: 'VALIDATE_DRAFT';
}

export interface SendChatMessageResult {
  readonly userMessage: ChatMessage;
  readonly assistantMessage: ChatMessage;
  readonly draft: SendChatMessageDraft;
}

export interface ChatBootstrapData {
  readonly session: ChatSessionSummary;
  readonly messages: readonly ChatMessage[];
}
