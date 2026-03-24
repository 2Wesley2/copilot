import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';
import {
  OPERATION_EXECUTION_STATUSES,
  type OperationExecutionStatus,
} from '../../../domain/operation-execution.entity.js';

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
  readonly status: OperationExecutionStatus;
}
@NestSchema({
  collection: MONGO_COLLECTION_NAMES.operationExecution,
  timestamps: false,
  versionKey: false,
})
export class OperationExecutionDefinition {
  @Prop({ type: Number, default: 1, min: 1 })
  public attempt!: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.operationDraft,
    required: true,
    index: true,
  })
  public draftId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.draftDecision,
    required: true,
    index: true,
  })
  public decisionId!: Types.ObjectId;

  @Prop({ type: String, required: false })
  public errorMessage?: string | undefined;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public executedPayload?: unknown;

  @Prop({ type: Date, default: null, index: true })
  public executedAt?: Date | null | undefined;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.actor,
    default: null,
    index: true,
  })
  public executedById?: Types.ObjectId | null | undefined;

  @Prop({ type: Date, default: null })
  public finishedAt?: Date | null | undefined;

  @Prop({ type: Boolean, default: true, index: true })
  public isFinal!: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public resultSnapshot?: unknown;

  @Prop({ type: Date, default: null })
  public startedAt?: Date | null | undefined;

  @Prop({
    type: String,
    enum: OPERATION_EXECUTION_STATUSES,
    default: 'PENDING',
    index: true,
  })
  public status!: OperationExecutionStatus;
}

export type OperationExecutionMongoDocument = HydratedDocument<OperationExecutionDefinition>;
export const OPERATION_EXECUTION_MODEL_NAME = MONGO_MODEL_NAMES.operationExecution;
export const operationExecutionSchema = SchemaFactory.createForClass(OperationExecutionDefinition);
