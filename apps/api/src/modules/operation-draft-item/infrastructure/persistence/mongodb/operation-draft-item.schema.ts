import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

const DRAFT_ITEM_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const DRAFT_ITEM_VALIDATION_STATUSES = ['PENDING', 'VALID', 'INVALID', 'REQUIRES_ATTENTION'] as const;

export interface OperationDraftItemMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly action: (typeof DRAFT_ITEM_ACTIONS)[number];
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
  readonly validationStatus: string;
}

@NestSchema({ collection: MONGO_COLLECTION_NAMES.operationDraftItem, timestamps: true, versionKey: false })
export class OperationDraftItemMongoModel {
  @Prop({ type: String, enum: DRAFT_ITEM_ACTIONS, required: true }) public action!: (typeof DRAFT_ITEM_ACTIONS)[number];
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public currentStateSnapshot?: unknown;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public diffSnapshot?: unknown;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.operationDraft, required: true, index: true }) public draftId!: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public payload?: unknown;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public pendingRequirements?: unknown;
  @Prop({ type: Number, default: 0, min: 0 }) public position!: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.product, default: null, index: true }) public productId?: Types.ObjectId | null;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public proposedStateSnapshot?: unknown;
  @Prop({ type: String, enum: DRAFT_ITEM_VALIDATION_STATUSES, default: 'PENDING', index: true }) public validationStatus!: string;
}

export type OperationDraftItemMongoDocument = HydratedDocument<OperationDraftItemMongoPersistence>;
export const OperationDraftItemSchema = SchemaFactory.createForClass(OperationDraftItemMongoModel);
OperationDraftItemSchema.index({ draftId: 1, position: 1 }, { unique: true });
OperationDraftItemSchema.index({ productId: 1 });
OperationDraftItemSchema.index({ validationStatus: 1, updatedAt: 1 });

export const OPERATION_DRAFT_ITEM_MODEL_NAME = MONGO_MODEL_NAMES.operationDraftItem;
