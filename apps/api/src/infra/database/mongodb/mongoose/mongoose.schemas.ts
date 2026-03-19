import type { ModelDefinition as NestSchemaDefinition } from '@nestjs/mongoose';
import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Schema as MongooseSchemaType } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

const MESSAGE_ROLES = ['SYSTEM', 'USER', 'ASSISTANT'] as const;
const SESSION_STATUSES = ['ACTIVE', 'CLOSED', 'ABANDONED'] as const;
const OPERATION_TYPES = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const DRAFT_STATUSES = ['PENDING', 'READY_FOR_REVIEW', 'CONFIRMED', 'REJECTED'] as const;
const DRAFT_ITEM_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const DRAFT_ITEM_VALIDATION_STATUSES = [
  'PENDING',
  'VALID',
  'INVALID',
  'REQUIRES_ATTENTION',
] as const;
const DECISION_TYPES = ['APPROVED', 'REJECTED', 'CANCELLED', 'REVISED'] as const;
const EXECUTION_STATUSES = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'] as const;
interface MongoSchemaCatalog {
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
export const MONGO_SCHEMAS: MongoSchemaCatalog = Object.freeze({
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
@NestSchema({ collection: MONGO_SCHEMAS.collections.actor, timestamps: true, versionKey: false })
export class Actor {
  @Prop({ type: String, trim: true, lowercase: true, required: false }) public email?: string;
  @Prop({ type: String, trim: true, unique: true, sparse: true, required: false })
  public externalId?: string;
  @Prop({ type: String, trim: true, required: false }) public name?: string;
}
export type ActorDocument = HydratedDocument<Actor>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.conversationSession,
  timestamps: true,
  versionKey: false,
})
export class ConversationSession {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    required: true,
    index: true,
  })
  public actorId!: Types.ObjectId;
  @Prop({ type: Date, default: null, index: true }) public endedAt?: Date | null;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public metadata?: unknown;
  @Prop({ type: String, enum: SESSION_STATUSES, default: 'ACTIVE', index: true })
  public status!: (typeof SESSION_STATUSES)[number];
}
export type ConversationSessionDocument = HydratedDocument<ConversationSession>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.conversationMessage,
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  versionKey: false,
})
export class ConversationMessage {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    index: true,
    default: null,
  })
  public actorId?: Types.ObjectId | null;
  @Prop({ type: String, required: true }) public content!: string;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationDraft,
    index: true,
    default: null,
  })
  public draftId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public metadata?: unknown;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationExecution,
    index: true,
    default: null,
  })
  public operationExecutionId?: Types.ObjectId | null;
  @Prop({ type: String, enum: MESSAGE_ROLES, required: true, index: true })
  public role!: (typeof MESSAGE_ROLES)[number];
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.conversationSession,
    required: true,
    index: true,
  })
  public sessionId!: Types.ObjectId;
  @Prop({ type: Boolean, default: false }) public streamed!: boolean;
}
export type ConversationMessageDocument = HydratedDocument<ConversationMessage>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.operationDraft,
  timestamps: true,
  versionKey: false,
})
export class OperationDraft {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    required: true,
    index: true,
  })
  public actorId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public approvedRevision?: unknown;
  @Prop({ type: String, required: true, trim: true }) public intent!: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public intentSnapshot?: unknown;
  @Prop({ type: String, enum: OPERATION_TYPES, required: true, index: true })
  public operationType!: (typeof OPERATION_TYPES)[number];
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public payload?: unknown;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.conversationSession,
    required: true,
    index: true,
  })
  public sessionId!: Types.ObjectId;
  @Prop({ type: String, enum: DRAFT_STATUSES, default: 'PENDING', index: true })
  public status!: (typeof DRAFT_STATUSES)[number];
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public structuredPayload?: unknown;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public validationSummary?: unknown;
}
export type OperationDraftDocument = HydratedDocument<OperationDraft>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.operationDraftItem,
  timestamps: true,
  versionKey: false,
})
export class OperationDraftItem {
  @Prop({ type: String, enum: DRAFT_ITEM_ACTIONS, required: true })
  public action!: (typeof DRAFT_ITEM_ACTIONS)[number];
  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public currentStateSnapshot?: unknown;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public diffSnapshot?: unknown;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationDraft,
    required: true,
    index: true,
  })
  public draftId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public payload?: unknown;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public pendingRequirements?: unknown;
  @Prop({ type: Number, default: 0, min: 0 }) public position!: number;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.product,
    default: null,
    index: true,
  })
  public productId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public proposedStateSnapshot?: unknown;
  @Prop({ type: String, enum: DRAFT_ITEM_VALIDATION_STATUSES, default: 'PENDING', index: true })
  public validationStatus!: (typeof DRAFT_ITEM_VALIDATION_STATUSES)[number];
}
export type OperationDraftItemDocument = HydratedDocument<OperationDraftItem>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.draftDecision,
  timestamps: { createdAt: 'decidedAt', updatedAt: false },
  versionKey: false,
})
export class DraftDecision {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    required: true,
    index: true,
  })
  public actorId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public decisionPayload?: unknown;
  @Prop({ type: String, enum: DECISION_TYPES, required: true, index: true })
  public decisionType!: (typeof DECISION_TYPES)[number];
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationDraft,
    required: true,
    index: true,
  })
  public draftId!: Types.ObjectId;
  @Prop({ type: Boolean, default: true, index: true }) public isFinal!: boolean;
}
export type DraftDecisionDocument = HydratedDocument<DraftDecision>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.operationExecution,
  timestamps: false,
  versionKey: false,
})
export class OperationExecution {
  @Prop({ type: Number, default: 1, min: 1 }) public attempt!: number;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationDraft,
    required: true,
    index: true,
  })
  public draftId!: Types.ObjectId;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.draftDecision,
    required: true,
    index: true,
  })
  public decisionId!: Types.ObjectId;
  @Prop({ type: String, required: false }) public errorMessage?: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public executedPayload?: unknown;
  @Prop({ type: Date, default: null, index: true }) public executedAt?: Date | null;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    default: null,
    index: true,
  })
  public executedById?: Types.ObjectId | null;
  @Prop({ type: Date, default: null }) public finishedAt?: Date | null;
  @Prop({ type: Boolean, default: true, index: true }) public isFinal!: boolean;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public resultSnapshot?: unknown;
  @Prop({ type: Date, default: null }) public startedAt?: Date | null;
  @Prop({ type: String, enum: EXECUTION_STATUSES, default: 'PENDING', index: true })
  public status!: (typeof EXECUTION_STATUSES)[number];
}
export type OperationExecutionDocument = HydratedDocument<OperationExecution>;
@NestSchema({
  collection: MONGO_SCHEMAS.collections.auditEvent,
  timestamps: { createdAt: 'occurredAt', updatedAt: false },
  versionKey: false,
})
export class AuditEvent {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    default: null,
    index: true,
  })
  public actorId?: Types.ObjectId | null;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.draftDecision,
    default: null,
    index: true,
  })
  public decisionId?: Types.ObjectId | null;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationDraft,
    default: null,
    index: true,
  })
  public draftId?: Types.ObjectId | null;
  @Prop({ type: String, trim: true, required: false }) public entityId?: string;
  @Prop({ type: String, trim: true, required: false }) public entityType?: string;
  @Prop({ type: String, required: true, trim: true, index: true }) public kind!: string;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.conversationMessage,
    default: null,
    index: true,
  })
  public messageId?: Types.ObjectId | null;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.operationExecution,
    default: null,
    index: true,
  })
  public operationExecutionId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public payload?: unknown;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.product,
    default: null,
    index: true,
  })
  public productId?: Types.ObjectId | null;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.conversationSession,
    default: null,
    index: true,
  })
  public sessionId?: Types.ObjectId | null;
}
export type AuditEventDocument = HydratedDocument<AuditEvent>;
@NestSchema({ collection: MONGO_SCHEMAS.collections.product, timestamps: true, versionKey: false })
export class Product {
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public attributes?: unknown;
  @Prop({ type: Date, default: null, index: true }) public deletedAt?: Date | null;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.actor,
    default: null,
    index: true,
  })
  public deletedById?: Types.ObjectId | null;
  @Prop({ type: String, required: false }) public description?: string;
  @Prop({ type: Boolean, default: true, index: true }) public isCurrent!: boolean;
  @Prop({ type: String, default: (): string => new Types.ObjectId().toHexString(), index: true })
  public lineageKey!: string;
  @Prop({ type: String, required: true, trim: true }) public name!: string;
  @Prop({ type: Number, default: 0, min: 0 }) public priceCents!: number;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_SCHEMAS.names.product,
    sparse: true,
    unique: true,
    default: null,
  })
  public previousVersionId?: Types.ObjectId | null;
  @Prop({ type: String, required: true, trim: true, index: true }) public sku!: string;
  @Prop({ type: Number, default: 0, min: 0 }) public stock!: number;
  @Prop({ type: Number, default: 1, min: 1 }) public version!: number;
}
export type ProductDocument = HydratedDocument<Product>;
export class MongoSchemaRegistry {
  private static instance: MongoSchemaRegistry | undefined;
  private actorSchema: MongooseSchemaType<Actor> | undefined;
  private conversationSessionSchema: MongooseSchemaType<ConversationSession> | undefined;
  private conversationMessageSchema: MongooseSchemaType<ConversationMessage> | undefined;
  private operationDraftSchema: MongooseSchemaType<OperationDraft> | undefined;
  private operationDraftItemSchema: MongooseSchemaType<OperationDraftItem> | undefined;
  private draftDecisionSchema: MongooseSchemaType<DraftDecision> | undefined;
  private operationExecutionSchema: MongooseSchemaType<OperationExecution> | undefined;
  private auditEventSchema: MongooseSchemaType<AuditEvent> | undefined;
  private productSchema: MongooseSchemaType<Product> | undefined;
  private schemaDefinitions: NestSchemaDefinition[] | undefined;
  private constructor() {
    /* empty */
  }
  public static getInstance(): MongoSchemaRegistry {
    MongoSchemaRegistry.instance ??= new MongoSchemaRegistry();
    return MongoSchemaRegistry.instance;
  }
  public getActorSchema(): MongooseSchemaType<Actor> {
    this.actorSchema ??= this.createActorSchema();
    return this.actorSchema;
  }
  public getConversationSessionSchema(): MongooseSchemaType<ConversationSession> {
    this.conversationSessionSchema ??= this.createConversationSessionSchema();
    return this.conversationSessionSchema;
  }
  public getConversationMessageSchema(): MongooseSchemaType<ConversationMessage> {
    this.conversationMessageSchema ??= this.createConversationMessageSchema();
    return this.conversationMessageSchema;
  }
  public getOperationDraftSchema(): MongooseSchemaType<OperationDraft> {
    this.operationDraftSchema ??= this.createOperationDraftSchema();
    return this.operationDraftSchema;
  }
  public getOperationDraftItemSchema(): MongooseSchemaType<OperationDraftItem> {
    this.operationDraftItemSchema ??= this.createOperationDraftItemSchema();
    return this.operationDraftItemSchema;
  }
  public getDraftDecisionSchema(): MongooseSchemaType<DraftDecision> {
    this.draftDecisionSchema ??= this.createDraftDecisionSchema();
    return this.draftDecisionSchema;
  }
  public getOperationExecutionSchema(): MongooseSchemaType<OperationExecution> {
    this.operationExecutionSchema ??= this.createOperationExecutionSchema();
    return this.operationExecutionSchema;
  }
  public getAuditEventSchema(): MongooseSchemaType<AuditEvent> {
    this.auditEventSchema ??= this.createAuditEventSchema();
    return this.auditEventSchema;
  }
  public getProductSchema(): MongooseSchemaType<Product> {
    this.productSchema ??= this.createProductSchema();
    return this.productSchema;
  }
  public getSchemaDefinitions(): NestSchemaDefinition[] {
    this.schemaDefinitions ??= [
      this.createSchemaDefinition(MONGO_SCHEMAS.names.actor, this.getActorSchema()),
      this.createSchemaDefinition(
        MONGO_SCHEMAS.names.conversationSession,
        this.getConversationSessionSchema(),
      ),
      this.createSchemaDefinition(
        MONGO_SCHEMAS.names.conversationMessage,
        this.getConversationMessageSchema(),
      ),
      this.createSchemaDefinition(
        MONGO_SCHEMAS.names.operationDraft,
        this.getOperationDraftSchema(),
      ),
      this.createSchemaDefinition(
        MONGO_SCHEMAS.names.operationDraftItem,
        this.getOperationDraftItemSchema(),
      ),
      this.createSchemaDefinition(MONGO_SCHEMAS.names.draftDecision, this.getDraftDecisionSchema()),
      this.createSchemaDefinition(
        MONGO_SCHEMAS.names.operationExecution,
        this.getOperationExecutionSchema(),
      ),
      this.createSchemaDefinition(MONGO_SCHEMAS.names.auditEvent, this.getAuditEventSchema()),
      this.createSchemaDefinition(MONGO_SCHEMAS.names.product, this.getProductSchema()),
    ];
    return this.schemaDefinitions;
  }
  private createSchemaDefinition(name: string, schema: MongooseSchemaType): NestSchemaDefinition {
    return { name, schema };
  }
  private createActorSchema(): MongooseSchemaType<Actor> {
    const schema = SchemaFactory.createForClass(Actor);
    schema.index({ externalId: 1 }, { unique: true, sparse: true });
    schema.index({ email: 1 });
    return schema;
  }
  private createConversationSessionSchema(): MongooseSchemaType<ConversationSession> {
    const schema = SchemaFactory.createForClass(ConversationSession);
    schema.index({ actorId: 1, createdAt: 1 });
    schema.index({ actorId: 1, status: 1, createdAt: 1 });
    schema.index({ status: 1, createdAt: 1 });
    return schema;
  }
  private createConversationMessageSchema(): MongooseSchemaType<ConversationMessage> {
    const schema = SchemaFactory.createForClass(ConversationMessage);
    schema.index({ sessionId: 1, createdAt: 1 });
    schema.index({ actorId: 1, createdAt: 1 });
    schema.index({ role: 1, createdAt: 1 });
    schema.index({ draftId: 1, createdAt: 1 });
    schema.index({ operationExecutionId: 1, createdAt: 1 });
    return schema;
  }
  private createOperationDraftSchema(): MongooseSchemaType<OperationDraft> {
    const schema = SchemaFactory.createForClass(OperationDraft);
    schema.index({ sessionId: 1, createdAt: 1 });
    schema.index({ actorId: 1, createdAt: 1 });
    schema.index({ status: 1, createdAt: 1 });
    schema.index({ operationType: 1, createdAt: 1 });
    return schema;
  }
  private createOperationDraftItemSchema(): MongooseSchemaType<OperationDraftItem> {
    const schema = SchemaFactory.createForClass(OperationDraftItem);
    schema.index({ draftId: 1, position: 1 }, { unique: true });
    schema.index({ productId: 1 });
    schema.index({ validationStatus: 1, updatedAt: 1 });
    return schema;
  }
  private createDraftDecisionSchema(): MongooseSchemaType<DraftDecision> {
    const schema = SchemaFactory.createForClass(DraftDecision);
    schema.index({ draftId: 1, decidedAt: 1 });
    schema.index({ actorId: 1, decidedAt: 1 });
    schema.index({ decisionType: 1, decidedAt: 1 });
    schema.index(
      { draftId: 1, isFinal: 1 },
      { unique: true, partialFilterExpression: { isFinal: true } },
    );
    return schema;
  }
  private createOperationExecutionSchema(): MongooseSchemaType<OperationExecution> {
    const schema = SchemaFactory.createForClass(OperationExecution);
    schema.index({ draftId: 1, startedAt: 1 });
    schema.index({ decisionId: 1, startedAt: 1 });
    schema.index({ status: 1, startedAt: 1 });
    schema.index({ executedById: 1, executedAt: 1 });
    schema.index(
      { draftId: 1, isFinal: 1 },
      { unique: true, partialFilterExpression: { isFinal: true } },
    );
    schema.index(
      { decisionId: 1, isFinal: 1 },
      { unique: true, partialFilterExpression: { isFinal: true } },
    );
    return schema;
  }
  private createAuditEventSchema(): MongooseSchemaType<AuditEvent> {
    const schema = SchemaFactory.createForClass(AuditEvent);
    schema.index({ occurredAt: 1 });
    schema.index({ kind: 1, occurredAt: 1 });
    schema.index({ actorId: 1, occurredAt: 1 });
    schema.index({ sessionId: 1, occurredAt: 1 });
    schema.index({ messageId: 1, occurredAt: 1 });
    schema.index({ draftId: 1, occurredAt: 1 });
    schema.index({ decisionId: 1, occurredAt: 1 });
    schema.index({ operationExecutionId: 1, occurredAt: 1 });
    schema.index({ productId: 1, occurredAt: 1 });
    return schema;
  }
  private createProductSchema(): MongooseSchemaType<Product> {
    const schema = SchemaFactory.createForClass(Product);
    schema.index({ deletedAt: 1 });
    schema.index({ deletedById: 1, deletedAt: 1 });
    schema.index({ lineageKey: 1, version: 1 }, { unique: true });
    schema.index(
      { sku: 1 },
      { unique: true, partialFilterExpression: { isCurrent: true, deletedAt: null } },
    );
    schema.index({ sku: 1, isCurrent: 1, version: 1 });
    return schema;
  }
}
export function getMongoSchemaRegistry(): MongoSchemaRegistry {
  return MongoSchemaRegistry.getInstance();
}
export const mongoSchemaRegistry = getMongoSchemaRegistry();
export const mongoSchemas = Object.freeze({
  actor: mongoSchemaRegistry.getActorSchema(),
  conversationSession: mongoSchemaRegistry.getConversationSessionSchema(),
  conversationMessage: mongoSchemaRegistry.getConversationMessageSchema(),
  operationDraft: mongoSchemaRegistry.getOperationDraftSchema(),
  operationDraftItem: mongoSchemaRegistry.getOperationDraftItemSchema(),
  draftDecision: mongoSchemaRegistry.getDraftDecisionSchema(),
  operationExecution: mongoSchemaRegistry.getOperationExecutionSchema(),
  auditEvent: mongoSchemaRegistry.getAuditEventSchema(),
  product: mongoSchemaRegistry.getProductSchema(),
});
export const mongoSchemaDefinitions: NestSchemaDefinition[] =
  mongoSchemaRegistry.getSchemaDefinitions();
