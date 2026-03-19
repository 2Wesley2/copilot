import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ACTOR_REPOSITORY } from '../../../domain/actor.repository.js';
import { ACTOR_MODEL_NAME, ActorSchema } from './actor.schema.js';
import { ActorMapper } from './actor.mapper.js';
import { ActorMongooseRepository } from './actor-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: ACTOR_MODEL_NAME, schema: ActorSchema }])],
  providers: [
    ActorMapper,
    ActorMongooseRepository,
    {
      provide: ACTOR_REPOSITORY,
      useExisting: ActorMongooseRepository,
    },
  ],
  exports: [ACTOR_REPOSITORY],
})
export class ActorMongoPersistenceModule {}
