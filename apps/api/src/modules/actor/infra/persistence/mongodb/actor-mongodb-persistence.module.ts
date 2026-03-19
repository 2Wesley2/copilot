import { Module } from '@nestjs/common';

import { ACTOR_REPOSITORY } from '../../../domain/actor.repository.js';
import { MongooseActorMapper } from './mongoose-actor.mapper.js';
import { MongooseActorRepositoryAdapter } from './mongoose-actor.repository.js';

@Module({
  providers: [
    MongooseActorMapper,
    MongooseActorRepositoryAdapter,
    {
      provide: ACTOR_REPOSITORY,
      useExisting: MongooseActorRepositoryAdapter,
    },
  ],
  exports: [ACTOR_REPOSITORY],
})
export class ActorMongoPersistenceModule {}
