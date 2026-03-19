import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

const SESSION_STATUSES = ['ACTIVE', 'CLOSED', 'ABANDONED'] as const;

export interface ConversationSessionMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId: Types.ObjectId;
  readonly createdAt: Date;
  readonly endedAt?: Date | null;
  readonly metadata?: unknown;
  readonly status: (typeof SESSION_STATUSES)[number];
  readonly updatedAt: Date;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.conversationSession,
  timestamps: true,
  versionKey: false,
})
export class ConversationSessionMongoModel {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.actor,
    required: true,
    index: true,
  })
  public actorId!: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  public endedAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public metadata?: unknown;

  @Prop({ type: String, enum: SESSION_STATUSES, default: 'ACTIVE', index: true })
  public status!: (typeof SESSION_STATUSES)[number];
}

export type ConversationSessionMongoDocument = HydratedDocument<ConversationSessionMongoPersistence>;

export const ConversationSessionSchema = SchemaFactory.createForClass(ConversationSessionMongoModel);
ConversationSessionSchema.index({ actorId: 1, createdAt: 1 });
ConversationSessionSchema.index({ actorId: 1, status: 1, createdAt: 1 });
ConversationSessionSchema.index({ status: 1, createdAt: 1 });

export const CONVERSATION_SESSION_MODEL_NAME = MONGO_MODEL_NAMES.conversationSession;
