import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';

import {
  MONGO_COLLECTION_NAMES,
  MONGO_MODEL_NAMES,
} from '../../../../../infra/database/mongodb/mongoose/mongo-model.constants.js';

export interface ActorMongoPersistence {
  readonly _id: Types.ObjectId;
  readonly createdAt: Date;
  readonly email?: string | undefined;
  readonly externalId?: string | undefined;
  readonly name?: string | undefined;
  readonly updatedAt: Date;
}

@NestSchema({
  collection: MONGO_COLLECTION_NAMES.actor,
  timestamps: true,
  versionKey: false,
})
export class ActorDefinition {
  @Prop({ type: String, trim: true, lowercase: true, required: false, unique: true })
  public email?: string | undefined;

  @Prop({ type: String, trim: true, unique: true, sparse: true, required: false })
  public externalId?: string | undefined;

  @Prop({ type: String, trim: true, required: false })
  public name?: string | undefined;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

export type ActorMongoDocument = HydratedDocument<ActorDefinition>;

export const actorSchema = SchemaFactory.createForClass(ActorDefinition);

export const ACTOR_MODEL_NAME = MONGO_MODEL_NAMES.actor;
