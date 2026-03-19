import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DRAFT_DECISION_REPOSITORY } from '../../../domain/draft-decision.repository.js';
import { DRAFT_DECISION_MODEL_NAME, DraftDecisionSchema } from './draft-decision.schema.js';
import { DraftDecisionMapper } from './draft-decision.mapper.js';
import { DraftDecisionMongooseRepository } from './draft-decision-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: DRAFT_DECISION_MODEL_NAME, schema: DraftDecisionSchema }])],
  providers: [
    DraftDecisionMapper,
    DraftDecisionMongooseRepository,
    {
      provide: DRAFT_DECISION_REPOSITORY,
      useExisting: DraftDecisionMongooseRepository,
    },
  ],
  exports: [DRAFT_DECISION_REPOSITORY],
})
export class DraftDecisionMongoPersistenceModule {}
