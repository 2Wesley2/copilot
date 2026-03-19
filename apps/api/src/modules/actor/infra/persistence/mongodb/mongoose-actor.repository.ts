import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_SCHEMAS } from '../../../../../infra/database/mongodb/mongoose/mongoose.schemas.js';
import { Actor } from '../../../domain/actor.entity.js';
import type { ActorRepository } from '../../../domain/actor.repository.js';
import {
  type MongooseActorDocument,
  MongooseActorMapper,
  type MongooseActorPersistence,
} from './mongoose-actor.mapper.js';

@Injectable()
export class MongooseActorRepositoryAdapter implements ActorRepository {
  public constructor(
    @InjectModel(MONGO_SCHEMAS.names.actor)
    private readonly actorModel: Model<MongooseActorPersistence>,
    private readonly actorMapper: MongooseActorMapper,
  ) {}

  public findById(actorId: string): AsyncResult<Actor | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseActorDocument | null = await this.actorModel.findById(actorId).exec();

      if (isNullish(document)) {
        return null;
      }

      return this.actorMapper.toDomain(document);
    });
  }

  public findByExternalId(externalId: string): AsyncResult<Actor | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseActorDocument | null = await this.actorModel
        .findOne({ externalId })
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.actorMapper.toDomain(document);
    });
  }
}
