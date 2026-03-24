import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

const MESSAGE_ROLES = ['SYSTEM', 'USER', 'ASSISTANT'] as const;

export interface ConversationMessageMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId?: Types.ObjectId | null;
  readonly content: string;
  readonly createdAt: Date;
  readonly draftId?: Types.ObjectId | null;
  readonly metadata?: unknown;
  readonly operationExecutionId?: Types.ObjectId | null;
  readonly role: (typeof MESSAGE_ROLES)[number];
  readonly sessionId: Types.ObjectId;
  readonly streamed: boolean;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.conversationMessage,
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  versionKey: false,
})
export class ConversationMessageDefinition {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.actor,
    index: true,
    default: null,
  })
  public actorId?: Types.ObjectId | null | undefined;

  @Prop({ type: String, required: true })
  public content!: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.operationDraft,
    index: true,
    default: null,
  })
  public draftId?: Types.ObjectId | null | undefined;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public metadata?: unknown;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.operationExecution,
    index: true,
    default: null,
  })
  public operationExecutionId?: Types.ObjectId | null | undefined;

  @Prop({ type: String, enum: MESSAGE_ROLES, required: true, index: true })
  public role!: (typeof MESSAGE_ROLES)[number];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.conversationSession,
    required: true,
    index: true,
  })
  public sessionId!: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  public streamed!: boolean;

  declare public readonly createdAt: Date;
}

export const conversationMessageSchema = SchemaFactory.createForClass(
  ConversationMessageDefinition,
);
export type ConversationMessageMongoDocument = HydratedDocument<ConversationMessageDefinition>;
export const CONVERSATION_MESSAGE_MODEL_NAME = MONGO_MODEL_NAMES.conversationMessage;
