import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

export interface ProductMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly attributes?: unknown;
  readonly createdAt: Date;
  readonly deletedAt?: Date | null;
  readonly deletedById?: Types.ObjectId | null;
  readonly description?: string;
  readonly isCurrent: boolean;
  readonly lineageKey: string;
  readonly name: string;
  readonly previousVersionId?: Types.ObjectId | null;
  readonly priceCents: number;
  readonly sku: string;
  readonly stock: number;
  readonly updatedAt: Date;
  readonly version: number;
}

@NestSchema({ collection: MONGO_COLLECTION_NAMES.product, timestamps: true, versionKey: false })
export class ProductMongoModel {
  @Prop({ type: MongooseSchema.Types.Mixed, required: false }) public attributes?: unknown;
  @Prop({ type: Date, default: null, index: true }) public deletedAt?: Date | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.actor, default: null, index: true }) public deletedById?: Types.ObjectId | null;
  @Prop({ type: String, required: false }) public description?: string;
  @Prop({ type: Boolean, default: true, index: true }) public isCurrent!: boolean;
  @Prop({ type: String, default: (): string => new Types.ObjectId().toHexString(), index: true }) public lineageKey!: string;
  @Prop({ type: String, required: true, trim: true }) public name!: string;
  @Prop({ type: Number, default: 0, min: 0 }) public priceCents!: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: MONGO_MODEL_NAMES.product, sparse: true, unique: true, default: null }) public previousVersionId?: Types.ObjectId | null;
  @Prop({ type: String, required: true, trim: true, index: true }) public sku!: string;
  @Prop({ type: Number, default: 0, min: 0 }) public stock!: number;
  @Prop({ type: Number, default: 1, min: 1 }) public version!: number;
}

export type ProductMongoDocument = HydratedDocument<ProductMongoPersistence>;
export const ProductSchema = SchemaFactory.createForClass(ProductMongoModel);
ProductSchema.index({ sku: 1, version: 1 }, { unique: true });
ProductSchema.index({ lineageKey: 1, version: -1 });
ProductSchema.index({ isCurrent: 1, deletedAt: 1 });

export const PRODUCT_MODEL_NAME = MONGO_MODEL_NAMES.product;
