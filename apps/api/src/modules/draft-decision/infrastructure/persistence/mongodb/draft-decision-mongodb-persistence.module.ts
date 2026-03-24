import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DRAFT_DECISION_REPOSITORY } from '../../../domain/draft-decision.repository.js';
import { DraftDecisionMapper } from './draft-decision.mapper.js';
import { DRAFT_DECISION_MODEL_NAME, draftDecisionSchema } from './draft-decision.schema.js';
import { DraftDecisionMongooseRepository } from './draft-decision-mongoose.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DRAFT_DECISION_MODEL_NAME, schema: draftDecisionSchema }]),
  ],
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
