import type { ModelDefinition } from '@nestjs/mongoose';
import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

const MESSAGE_ROLES = ['SYSTEM', 'USER', 'ASSISTANT'] as const;
const DRAFT_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED'] as const;
const DRAFT_ITEM_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const EXECUTION_STATUSES = ['PENDING', 'SUCCESS', 'FAILED'] as const;

interface MongoModelCatalog {
  readonly names: {
    readonly actor: string;
    readonly conversationSession: string;
    readonly conversationMessage: string;
    readonly operationDraft: string;
    readonly operationDraftItem: string;
    readonly draftDecision: string;
    readonly operationExecution: string;
    readonly auditEvent: string;
    readonly product: string;
  };
  readonly collections: {
    readonly actor: string;
    readonly conversationSession: string;
    readonly conversationMessage: string;
    readonly operationDraft: string;
    readonly operationDraftItem: string;
    readonly draftDecision: string;
    readonly operationExecution: string;
    readonly auditEvent: string;
    readonly product: string;
  };
}

export const MONGO_MODELS: MongoModelCatalog = Object.freeze({
  names: Object.freeze({
    actor: 'Actor',
    auditEvent: 'AuditEvent',
    conversationMessage: 'ConversationMessage',
    conversationSession: 'ConversationSession',
    draftDecision: 'DraftDecision',
    operationDraft: 'OperationDraft',
    operationDraftItem: 'OperationDraftItem',
    operationExecution: 'OperationExecution',
    product: 'Product',
  }),
  collections: Object.freeze({
    actor: 'actors',
    auditEvent: 'audit_events',
    conversationMessage: 'conversation_messages',
    conversationSession: 'conversation_sessions',
    draftDecision: 'draft_decisions',
    operationDraft: 'operation_drafts',
    operationDraftItem: 'operation_draft_items',
    operationExecution: 'operation_executions',
    product: 'products',
  }),
});

/*
  Nest-style schema classes. Use `@Prop` to define fields and `SchemaFactory.createForClass`
  to build Mongoose schemas. Indexes and schema options match the previous creators.
*/

@NestSchema({ collection: MONGO_MODELS.collections.actor, timestamps: true, versionKey: false })
export class Actor {
  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true, unique: true, sparse: true })
  externalId?: string;

  @Prop({ trim: true })
  name?: string;
}
export const ActorSchema = SchemaFactory.createForClass(Actor);
export type ActorDocument = HydratedDocument<Actor>;
ActorSchema.index({ externalId: 1 });

@NestSchema({
  collection: MONGO_MODELS.collections.conversationSession,
  timestamps: true,
  versionKey: false,
})
export class ConversationSession {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.actor,
    required: true,
    index: true,
  })
  actorId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: unknown;
}
export const ConversationSessionSchema = SchemaFactory.createForClass(ConversationSession);
export type ConversationSessionDocument = HydratedDocument<ConversationSession>;
ConversationSessionSchema.index({ actorId: 1, createdAt: 1 });

@NestSchema({
  collection: MONGO_MODELS.collections.conversationMessage,
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  versionKey: false,
})
export class ConversationMessage {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.actor,
    index: true,
    default: null,
  })
  actorId?: Types.ObjectId | null;

  @Prop({ required: true })
  content!: string;

  @Prop({ enum: MESSAGE_ROLES, required: true })
  role!: (typeof MESSAGE_ROLES)[number];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.conversationSession,
    required: true,
    index: true,
  })
  sessionId!: Types.ObjectId;

  @Prop({ default: false })
  streamed?: boolean;
}
export const ConversationMessageSchema = SchemaFactory.createForClass(ConversationMessage);
export type ConversationMessageDocument = HydratedDocument<ConversationMessage>;
ConversationMessageSchema.index({ actorId: 1, createdAt: 1 });
ConversationMessageSchema.index({ sessionId: 1, createdAt: 1 });

@NestSchema({
  collection: MONGO_MODELS.collections.operationDraft,
  timestamps: true,
  versionKey: false,
})
export class OperationDraft {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.actor,
    required: true,
    index: true,
  })
  actorId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  intent!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload!: unknown;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.conversationSession,
    required: true,
    index: true,
  })
  sessionId!: Types.ObjectId;

  @Prop({ enum: DRAFT_STATUSES, default: 'PENDING', index: true })
  status!: (typeof DRAFT_STATUSES)[number];
}
export const OperationDraftSchema = SchemaFactory.createForClass(OperationDraft);
export type OperationDraftDocument = HydratedDocument<OperationDraft>;
OperationDraftSchema.index({ actorId: 1, createdAt: 1 });
OperationDraftSchema.index({ sessionId: 1, createdAt: 1 });
OperationDraftSchema.index({ status: 1, createdAt: 1 });

@NestSchema({
  collection: MONGO_MODELS.collections.operationDraftItem,
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  versionKey: false,
})
export class OperationDraftItem {
  @Prop({ enum: DRAFT_ITEM_ACTIONS, required: true })
  action!: (typeof DRAFT_ITEM_ACTIONS)[number];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.operationDraft,
    required: true,
    index: true,
  })
  draftId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload!: unknown;

  @Prop({ default: 0 })
  position!: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.product,
    default: null,
    index: true,
  })
  productId?: Types.ObjectId | null;
}
export const OperationDraftItemSchema = SchemaFactory.createForClass(OperationDraftItem);
export type OperationDraftItemDocument = HydratedDocument<OperationDraftItem>;
OperationDraftItemSchema.index({ productId: 1 });
OperationDraftItemSchema.index({ draftId: 1, position: 1 }, { unique: true });

@NestSchema({
  collection: MONGO_MODELS.collections.draftDecision,
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  versionKey: false,
})
export class DraftDecision {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.actor,
    required: true,
    index: true,
  })
  actorId!: Types.ObjectId;

  @Prop({ required: true })
  approved!: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.operationDraft,
    required: true,
    unique: true,
  })
  draftId!: Types.ObjectId;

  @Prop({})
  reason?: unknown;
}
export const DraftDecisionSchema = SchemaFactory.createForClass(DraftDecision);
export type DraftDecisionDocument = HydratedDocument<DraftDecision>;
DraftDecisionSchema.index({ actorId: 1, createdAt: 1 });

@NestSchema({
  collection: MONGO_MODELS.collections.operationExecution,
  timestamps: false,
  versionKey: false,
})
export class OperationExecution {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.operationDraft,
    required: true,
    unique: true,
  })
  draftId!: Types.ObjectId;

  @Prop({})
  errorMessage?: unknown;

  @Prop({})
  finishedAt?: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed })
  result?: unknown;

  @Prop({})
  startedAt?: unknown;

  @Prop({ enum: EXECUTION_STATUSES, default: 'PENDING', index: true })
  status!: (typeof EXECUTION_STATUSES)[number];
}
export const OperationExecutionSchema = SchemaFactory.createForClass(OperationExecution);
export type OperationExecutionDocument = HydratedDocument<OperationExecution>;
OperationExecutionSchema.index({ status: 1, startedAt: 1 });

@NestSchema({
  collection: MONGO_MODELS.collections.auditEvent,
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  versionKey: false,
})
export class AuditEvent {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.actor,
    default: null,
    index: true,
  })
  actorId?: Types.ObjectId | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.operationDraft,
    default: null,
    index: true,
  })
  draftId?: Types.ObjectId | null;

  @Prop({ trim: true })
  entityId?: string;

  @Prop({ trim: true })
  entityType?: string;

  @Prop({ required: true, trim: true, index: true })
  kind!: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.operationExecution,
    default: null,
    index: true,
  })
  operationExecutionId?: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.Mixed })
  payload?: unknown;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.conversationSession,
    default: null,
    index: true,
  })
  sessionId?: Types.ObjectId | null;
}
export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);
export type AuditEventDocument = HydratedDocument<AuditEvent>;
AuditEventSchema.index({ actorId: 1, createdAt: 1 });
AuditEventSchema.index({ draftId: 1, createdAt: 1 });
AuditEventSchema.index({ kind: 1, createdAt: 1 });
AuditEventSchema.index({ operationExecutionId: 1, createdAt: 1 });
AuditEventSchema.index({ sessionId: 1, createdAt: 1 });

@NestSchema({ collection: MONGO_MODELS.collections.product, timestamps: true, versionKey: false })
export class Product {
  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;

  @Prop({})
  description?: unknown;

  @Prop({ default: true, index: true })
  isCurrent?: boolean;

  @Prop({ default: (): string => new Types.ObjectId().toHexString() })
  lineageKey?: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODELS.names.product,
    sparse: true,
    unique: true,
    default: null,
  })
  previousVersionId?: Types.ObjectId | null;

  @Prop({ default: 0 })
  priceCents?: number;

  @Prop({ required: true, trim: true, index: true })
  sku!: string;

  @Prop({ default: 0 })
  stock?: number;

  @Prop({ default: 1 })
  version?: number;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = HydratedDocument<Product>;
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({ lineageKey: 1, version: 1 }, { unique: true });
ProductSchema.index({ sku: 1, isCurrent: 1 });

export const mongoModelDefinitions: ModelDefinition[] = [
  { name: Actor.name, schema: ActorSchema },
  { name: ConversationSession.name, schema: ConversationSessionSchema },
  { name: ConversationMessage.name, schema: ConversationMessageSchema },
  { name: OperationDraft.name, schema: OperationDraftSchema },
  { name: OperationDraftItem.name, schema: OperationDraftItemSchema },
  { name: DraftDecision.name, schema: DraftDecisionSchema },
  { name: OperationExecution.name, schema: OperationExecutionSchema },
  { name: AuditEvent.name, schema: AuditEventSchema },
  { name: Product.name, schema: ProductSchema },
];
