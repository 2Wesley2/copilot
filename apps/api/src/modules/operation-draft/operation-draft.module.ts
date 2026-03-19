import { Module } from '@nestjs/common';

import { OperationDraftController } from './presentation/http/operation-draft.controller.js';
import { OperationDraftMongoPersistenceModule } from './infrastructure/persistence/mongodb/operation-draft-mongodb-persistence.module.js';
import { OperationDraftService } from './application/operation-draft.service.js';

@Module({
  imports: [OperationDraftMongoPersistenceModule],
  controllers: [OperationDraftController],
  providers: [OperationDraftService],
  exports: [OperationDraftService],
})
export class OperationDraftModule {}
