import { Module, type Provider } from '@nestjs/common';

import { DRAFT_DECISION_REPOSITORY } from '../../../draft-decision.repository.js';
import { MongooseDraftDecisionMapper } from './mongoose-draft-decision.mapper.js';
import { MongooseDraftDecisionRepositoryAdapter } from './mongoose-draft-decision.repository.js';

const persistenceProviders: Provider[] = [
  MongooseDraftDecisionMapper,
  MongooseDraftDecisionRepositoryAdapter,
  {
    provide: DRAFT_DECISION_REPOSITORY,
    useExisting: MongooseDraftDecisionRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [DRAFT_DECISION_REPOSITORY],
})
export class DraftDecisionMongoPersistenceModule {}
