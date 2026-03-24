import { Module } from '@nestjs/common';

import { DraftDecisionService } from './application/draft-decision.service.js';
import { DraftDecisionMongoPersistenceModule } from './infrastructure/persistence/mongodb/draft-decision-mongodb-persistence.module.js';
import { DraftDecisionController } from './presentation/http/draft-decision.controller.js';

@Module({
  imports: [DraftDecisionMongoPersistenceModule],
  controllers: [DraftDecisionController],
  providers: [DraftDecisionService],
  exports: [DraftDecisionService],
})
export class DraftDecisionModule {}
