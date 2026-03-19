import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { Actor } from '../../../domain/actor.entity.js';
import type { ActorRepository } from '../../../domain/actor.repository.js';
import { ACTOR_MODEL_NAME, type ActorMongoDocument, type ActorMongoPersistence } from './actor.schema.js';
import { ActorMapper } from './actor.mapper.js';

@Injectable()
export class ActorMongooseRepository implements ActorRepository {
  public constructor(
    @InjectModel(ACTOR_MODEL_NAME)
    private readonly actorModel: Model<ActorMongoPersistence>,
    private readonly actorMapper: ActorMapper,
  ) {}

  public findById(actorId: string): AsyncResult<Actor | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: ActorMongoDocument | null = await this.actorModel.findById(actorId).exec();

      if (isNullish(document)) {
        return null;
      }

      return this.actorMapper.toDomain(document);
    });
  }

  public findByExternalId(externalId: string): AsyncResult<Actor | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: ActorMongoDocument | null = await this.actorModel
        .findOne({ externalId })
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.actorMapper.toDomain(document);
    });
  }
}
