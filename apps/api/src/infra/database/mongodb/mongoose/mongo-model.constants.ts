export const MONGO_MODEL_NAMES = Object.freeze({
  actor: 'Actor',
  auditEvent: 'AuditEvent',
  conversationMessage: 'ConversationMessage',
  conversationSession: 'ConversationSession',
  draftDecision: 'DraftDecision',
  operationDraft: 'OperationDraft',
  operationDraftItem: 'OperationDraftItem',
  operationExecution: 'OperationExecution',
  product: 'Product',
});

export const MONGO_COLLECTION_NAMES = Object.freeze({
  actor: 'actors',
  auditEvent: 'audit_events',
  conversationMessage: 'conversation_messages',
  conversationSession: 'conversation_sessions',
  draftDecision: 'draft_decisions',
  operationDraft: 'operation_drafts',
  operationDraftItem: 'operation_draft_items',
  operationExecution: 'operation_executions',
  product: 'products',
});
