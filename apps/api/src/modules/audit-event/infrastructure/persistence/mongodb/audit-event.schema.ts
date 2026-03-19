import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

export interface AuditEventMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId?: Types.ObjectId | null;
  readonly decisionId?: Types.ObjectId | null;
  readonly draftId?: Types.ObjectId | null;
  readonly entityId?: string;
  readonly entityType?: string;
  readonly kind: string;
  readonly messageId?: Types.ObjectId | null;
  readonly occurredAt: Date;
  readonly operationExecutionId?: Types.ObjectId | null;
  readonly payload?: unknown;
  readonly productId?: Types.ObjectId | null;
  readonly sessionId?: Types.ObjectId | null;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.auditEvent,
  timestamps: { createdAt: 'occurredAt', updatedAt: false },
  versionKey: false,
})
export class AuditEventMongoModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.actor, default: null, index: true }) public actorId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.draftDecision, default: null, index: true }) public decisionId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.operationDraft, default: null, index: true }) public draftId?: Types.ObjectId | null;
  @Prop({ type: String, trim: true, required: false }) public entityId?: string;
  @Prop({ type: String, trim: true, required: false }) public entityType?: string;
  @Prop({ type: String, required: true, trim: true, index: true }) public kind!: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.conversationMessage, default: null, index: true }) public messageId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.operationExecution, default: null, index: true }) public operationExecutionId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public payload?: unknown;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.product, default: null, index: true }) public productId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.conversationSession, default: null, index: true }) public sessionId?: Types.ObjectId | null;
}

export type AuditEventMongoDocument = HydratedDocument<AuditEventMongoPersistence>;
export const AuditEventSchema = SchemaFactory.createForClass(AuditEventMongoModel);
AuditEventSchema.index({ occurredAt: 1 });
AuditEventSchema.index({ kind: 1, occurredAt: 1 });
AuditEventSchema.index({ actorId: 1, occurredAt: 1 });
AuditEventSchema.index({ sessionId: 1, occurredAt: 1 });
AuditEventSchema.index({ messageId: 1, occurredAt: 1 });
AuditEventSchema.index({ draftId: 1, occurredAt: 1 });
AuditEventSchema.index({ decisionId: 1, occurredAt: 1 });
AuditEventSchema.index({ operationExecutionId: 1, occurredAt: 1 });
AuditEventSchema.index({ productId: 1, occurredAt: 1 });

export const AUDIT_EVENT_MODEL_NAME = MONGO_MODEL_NAMES.auditEvent;
