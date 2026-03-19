import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

const EXECUTION_STATUSES = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'] as const;

export interface OperationExecutionMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly attempt: number;
  readonly decisionId: Types.ObjectId;
  readonly draftId: Types.ObjectId;
  readonly errorMessage?: string;
  readonly executedAt?: Date | null;
  readonly executedById?: Types.ObjectId | null;
  readonly executedPayload?: unknown;
  readonly finishedAt?: Date | null;
  readonly isFinal: boolean;
  readonly resultSnapshot?: unknown;
  readonly startedAt?: Date | null;
  readonly status: string;
}

@NestSchema({ collection: MONGO_COLLECTION_NAMES.operationExecution, timestamps: false, versionKey: false })
export class OperationExecutionMongoModel {
  @Prop({ type: Number, default: 1, min: 1 }) public attempt!: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.operationDraft, required: true, index: true }) public draftId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.draftDecision, required: true, index: true }) public decisionId!: Types.ObjectId;
  @Prop({ type: String, required: false }) public errorMessage?: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public executedPayload?: unknown;
  @Prop({ type: Date, default: null, index: true }) public executedAt?: Date | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.actor, default: null, index: true }) public executedById?: Types.ObjectId | null;
  @Prop({ type: Date, default: null }) public finishedAt?: Date | null;
  @Prop({ type: Boolean, default: true, index: true }) public isFinal!: boolean;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public resultSnapshot?: unknown;
  @Prop({ type: Date, default: null }) public startedAt?: Date | null;
  @Prop({ type: String, enum: EXECUTION_STATUSES, default: 'PENDING', index: true }) public status!: string;
}

export type OperationExecutionMongoDocument = HydratedDocument<OperationExecutionMongoPersistence>;
export const OperationExecutionSchema = SchemaFactory.createForClass(OperationExecutionMongoModel);
OperationExecutionSchema.index({ draftId: 1, startedAt: 1 });
OperationExecutionSchema.index({ decisionId: 1, startedAt: 1 });
OperationExecutionSchema.index({ status: 1, startedAt: 1 });
OperationExecutionSchema.index({ executedById: 1, executedAt: 1 });
OperationExecutionSchema.index({ draftId: 1, isFinal: 1 }, { unique: true, partialFilterExpression: { isFinal: true } });
OperationExecutionSchema.index({ decisionId: 1, isFinal: 1 }, { unique: true, partialFilterExpression: { isFinal: true } });

export const OPERATION_EXECUTION_MODEL_NAME = MONGO_MODEL_NAMES.operationExecution;
