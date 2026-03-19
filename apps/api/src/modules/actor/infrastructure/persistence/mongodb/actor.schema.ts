import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

export interface ActorMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly createdAt: Date;
  readonly email?: string;
  readonly externalId?: string;
  readonly name?: string;
  readonly updatedAt: Date;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.actor,
  timestamps: true,
  versionKey: false,
})
export class ActorMongoModel {
  @Prop({ type: String, trim: true, lowercase: true, required: false })
  public email?: string;

  @Prop({ type: String, trim: true, unique: true, sparse: true, required: false })
  public externalId?: string;

  @Prop({ type: String, trim: true, required: false })
  public name?: string;
}

export type ActorMongoDocument = HydratedDocument<ActorMongoPersistence>;

export const ActorSchema = SchemaFactory.createForClass(ActorMongoModel);

ActorSchema.index({ externalId: 1 }, { unique: true, sparse: true });
ActorSchema.index({ email: 1 });

export const ACTOR_MODEL_NAME = MONGO_MODEL_NAMES.actor;
