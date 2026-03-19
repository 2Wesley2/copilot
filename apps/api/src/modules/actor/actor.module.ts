import { Module } from '@nestjs/common';

import { ActorService } from './application/actor.service.js';
import { ActorController } from './presentation/http/actor.controller.js';
import { ActorMongoPersistenceModule } from './infrastructure/persistence/mongodb/actor-mongodb-persistence.module.js';

@Module({
  imports: [ActorMongoPersistenceModule],
  controllers: [ActorController],
  providers: [ActorService],
  exports: [ActorService],
})
export class ActorModule {}
