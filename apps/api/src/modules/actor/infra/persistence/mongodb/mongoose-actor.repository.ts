import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_MODELS } from '../../../../../mongodb/mongoose.schemas.js';
import type { Actor } from '../../../actor.entity.js';
import type { ActorRepository } from '../../../actor.repository.js';
import {
  type MongooseActorDocument,
  type MongooseActorMapper,
  type MongooseActorPersistence,
} from './mongoose-actor.mapper.js';

@Injectable()
export class MongooseActorRepositoryAdapter implements ActorRepository {
  constructor(
    @InjectModel(MONGO_MODELS.names.actor)
    private readonly actorModel: Model<MongooseActorPersistence>,
    private readonly actorMapper: MongooseActorMapper,
  ) {}

  findById(actorId: string): AsyncResult<Actor | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseActorDocument | null = await this.actorModel.findById(actorId).exec();

      if (document === null) {
        return null;
      }

      return this.actorMapper.toDomain(document);
    });
  }

  findByExternalId(externalId: string): AsyncResult<Actor | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseActorDocument | null = await this.actorModel
        .findOne({ externalId })
        .exec();

      if (document === null) {
        return null;
      }

      return this.actorMapper.toDomain(document);
    });
  }
}
