import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import { type Actor, createActor } from '../../../domain/actor.entity.js';

import type { ActorMongoDocument, ActorMongoPersistence } from './actor.schema.js';

export class ActorMapper {
  public toDomain(document: ActorMongoDocument): Actor {
    return createActor({
      id: document._id.toHexString(),
      ...(isNullish(document.externalId) ? {} : { externalId: document.externalId }),
      ...(isNullish(document.name) ? {} : { name: document.name }),
      ...(isNullish(document.email) ? {} : { email: document.email }),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  public toPersistence(actor: Actor): ActorMongoPersistence {
    return {
      _id: new Types.ObjectId(actor.id),
      ...(isNullish(actor.externalId) ? {} : { externalId: actor.externalId }),
      ...(isNullish(actor.name) ? {} : { name: actor.name }),
      ...(isNullish(actor.email) ? {} : { email: actor.email }),
      createdAt: actor.createdAt,
      updatedAt: actor.updatedAt,
    };
  }
}
