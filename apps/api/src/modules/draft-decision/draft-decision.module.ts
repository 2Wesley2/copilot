import { Module } from '@nestjs/common';

import { DraftDecisionService } from './draft-decision.service.js';
import { DraftDecisionController } from './http/draft-decision.controller.js';
import { DraftDecisionMongoPersistenceModule } from './infra/persistence/mongodb/draft-decision-mongodb-persistence.module.js';

@Module({
  imports: [DraftDecisionMongoPersistenceModule],
  controllers: [DraftDecisionController],
  providers: [DraftDecisionService],
  exports: [DraftDecisionService],
})
export class DraftDecisionModule {}
