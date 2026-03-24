import { Module } from '@nestjs/common';

import { OperationDraftItemService } from './application/operation-draft-item.service.js';
import { OperationDraftItemMongoPersistenceModule } from './infrastructure/persistence/mongodb/operation-draft-item-mongodb-persistence.module.js';
import { OperationDraftItemController } from './presentation/http/operation-draft-item.controller.js';

@Module({
  imports: [OperationDraftItemMongoPersistenceModule],
  controllers: [OperationDraftItemController],
  providers: [OperationDraftItemService],
  exports: [OperationDraftItemService],
})
export class OperationDraftItemModule {}
