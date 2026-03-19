import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

const OPERATION_TYPES = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const DRAFT_STATUSES = ['PENDING', 'READY_FOR_REVIEW', 'CONFIRMED', 'REJECTED'] as const;

export interface OperationDraftMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId: Types.ObjectId;
  readonly approvedRevision?: unknown;
  readonly createdAt: Date;
  readonly intent: string;
  readonly intentSnapshot?: unknown;
  readonly operationType?: (typeof OPERATION_TYPES)[number];
  readonly payload?: unknown;
  readonly sessionId: Types.ObjectId;
  readonly status: string;
  readonly structuredPayload?: unknown;
  readonly updatedAt: Date;
  readonly validationSummary?: unknown;
}

@NestSchema({ collection: MONGO_COLLECTION_NAMES.operationDraft, timestamps: true, versionKey: false })
export class OperationDraftMongoModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.actor, required: true, index: true })
  public actorId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public approvedRevision?: unknown;
  @Prop({ type: String, required: true, trim: true }) public intent!: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public intentSnapshot?: unknown;
  @Prop({ type: String, enum: OPERATION_TYPES, required: false, index: true }) public operationType?: (typeof OPERATION_TYPES)[number];
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public payload?: unknown;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.conversationSession, required: true, index: true }) public sessionId!: Types.ObjectId;
  @Prop({ type: String, enum: DRAFT_STATUSES, default: 'PENDING', index: true }) public status!: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public structuredPayload?: unknown;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public validationSummary?: unknown;
}

export type OperationDraftMongoDocument = HydratedDocument<OperationDraftMongoPersistence>;
export const OperationDraftSchema = SchemaFactory.createForClass(OperationDraftMongoModel);
OperationDraftSchema.index({ sessionId: 1, createdAt: 1 });
OperationDraftSchema.index({ actorId: 1, createdAt: 1 });
OperationDraftSchema.index({ status: 1, createdAt: 1 });
OperationDraftSchema.index({ operationType: 1, createdAt: 1 });

export const OPERATION_DRAFT_MODEL_NAME = MONGO_MODEL_NAMES.operationDraft;
