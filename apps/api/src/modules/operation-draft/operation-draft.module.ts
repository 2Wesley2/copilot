import { Module } from '@nestjs/common';

import { OperationDraftController } from './http/operation-draft.controller.js';
import { OperationDraftMongoPersistenceModule } from './infra/persistence/mongodb/operation-draft-mongodb-persistence.module.js';
import { OperationDraftService } from './operation-draft.service.js';

@Module({
  imports: [OperationDraftMongoPersistenceModule],
  controllers: [OperationDraftController],
  providers: [OperationDraftService],
  exports: [OperationDraftService],
})
export class OperationDraftModule {}
