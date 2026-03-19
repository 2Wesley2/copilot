import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

const DECISION_TYPES = ['APPROVED', 'REJECTED', 'CANCELLED', 'REVISED'] as const;

export interface DraftDecisionMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId: Types.ObjectId;
  readonly decidedAt: Date;
  readonly decisionPayload?: unknown;
  readonly decisionType: (typeof DECISION_TYPES)[number];
  readonly draftId: Types.ObjectId;
  readonly isFinal: boolean;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.draftDecision,
  timestamps: { createdAt: 'decidedAt', updatedAt: false },
  versionKey: false,
})
export class DraftDecisionMongoModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.actor, required: true, index: true })
  public actorId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public decisionPayload?: unknown;
  @Prop({ type: String, enum: DECISION_TYPES, required: true, index: true }) public decisionType!: (typeof DECISION_TYPES)[number];
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.operationDraft, required: true, index: true }) public draftId!: Types.ObjectId;
  @Prop({ type: Boolean, default: true, index: true }) public isFinal!: boolean;
}

export type DraftDecisionMongoDocument = HydratedDocument<DraftDecisionMongoPersistence>;
export const DraftDecisionSchema = SchemaFactory.createForClass(DraftDecisionMongoModel);
DraftDecisionSchema.index({ draftId: 1, decidedAt: 1 });
DraftDecisionSchema.index({ actorId: 1, decidedAt: 1 });
DraftDecisionSchema.index({ decisionType: 1, decidedAt: 1 });
DraftDecisionSchema.index({ draftId: 1, isFinal: 1 }, { unique: true, partialFilterExpression: { isFinal: true } });

export const DRAFT_DECISION_MODEL_NAME = MONGO_MODEL_NAMES.draftDecision;
