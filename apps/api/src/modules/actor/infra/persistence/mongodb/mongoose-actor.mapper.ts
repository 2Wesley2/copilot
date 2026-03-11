import { isNullish } from '@copilot/shared';
import type { HydratedDocument, Types } from 'mongoose';

import { Actor } from '../../../actor.entity.js';

export interface MongooseActorPersistence {
  readonly _id: Types.ObjectId;
  readonly createdAt: Date;
  readonly email?: string;
  readonly externalId?: string;
  readonly name?: string;
  readonly updatedAt: Date;
}

export type MongooseActorDocument = HydratedDocument<MongooseActorPersistence>;
export class MongooseActorMapper {
  toDomain(document: MongooseActorDocument): Actor {
    return new Actor({
      id: document._id.toHexString(),
      ...(isNullish(document.externalId) ? {} : { externalId: document.externalId }),
      ...(isNullish(document.name) ? {} : { name: document.name }),
      ...(isNullish(document.email) ? {} : { email: document.email }),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
