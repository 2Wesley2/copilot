import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';
import {
  OPERATION_DRAFT_ITEM_ACTIONS,
  OPERATION_DRAFT_ITEM_VALIDATION_STATUSES,
  type OperationDraftItemAction,
  type OperationDraftItemValidationStatus,
} from '../../../domain/operation-draft-item.entity.js';

export interface OperationDraftItemMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly action: OperationDraftItemAction;
  readonly createdAt: Date;
  readonly currentStateSnapshot?: unknown;
  readonly diffSnapshot?: unknown;
  readonly draftId: Types.ObjectId;
  readonly payload?: unknown;
  readonly pendingRequirements?: unknown;
  readonly position: number;
  readonly productId?: Types.ObjectId | null;
  readonly proposedStateSnapshot?: unknown;
  readonly updatedAt: Date;
  readonly validationStatus: OperationDraftItemValidationStatus;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.operationDraftItem,
  timestamps: true,
  versionKey: false,
})
export class OperationDraftItemDefinition {
  @Prop({ type: String, enum: OPERATION_DRAFT_ITEM_ACTIONS, required: true })
  public action!: OperationDraftItemAction;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public currentStateSnapshot?: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public diffSnapshot?: unknown;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.operationDraft,
    required: true,
    index: true,
  })
  public draftId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public payload?: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public pendingRequirements?: unknown;

  @Prop({ type: Number, default: 0, min: 0 })
  public position!: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: MONGO_MODEL_NAMES.product,
    default: null,
    index: true,
  })
  public productId?: Types.ObjectId | null | undefined;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  public proposedStateSnapshot?: unknown;

  @Prop({
    type: String,
    enum: OPERATION_DRAFT_ITEM_VALIDATION_STATUSES,
    default: 'PENDING',
    index: true,
  })
  public validationStatus!: OperationDraftItemValidationStatus;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

export type OperationDraftItemMongoDocument = HydratedDocument<OperationDraftItemDefinition>;
export const OPERATION_DRAFT_ITEM_MODEL_NAME = MONGO_MODEL_NAMES.operationDraftItem;
export const operationDraftItemSchema = SchemaFactory.createForClass(OperationDraftItemDefinition);
