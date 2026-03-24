import { Module } from '@nestjs/common';

import { OperationDraftService } from './application/operation-draft.service.js';
import { OperationDraftMongoPersistenceModule } from './infrastructure/persistence/mongodb/operation-draft-mongodb-persistence.module.js';
import { OperationDraftController } from './presentation/http/operation-draft.controller.js';

@Module({
  imports: [OperationDraftMongoPersistenceModule],
  controllers: [OperationDraftController],
  providers: [OperationDraftService],
  exports: [OperationDraftService],
})
export class OperationDraftModule {}
