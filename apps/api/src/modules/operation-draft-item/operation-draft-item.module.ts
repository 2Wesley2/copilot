import { Module } from '@nestjs/common';

import { OperationDraftItemController } from './http/operation-draft-item.controller.js';
import { OperationDraftItemMongoPersistenceModule } from './infra/persistence/mongodb/operation-draft-item-mongodb-persistence.module.js';
import { OperationDraftItemService } from './operation-draft-item.service.js';

@Module({
  imports: [OperationDraftItemMongoPersistenceModule],
  controllers: [OperationDraftItemController],
  providers: [OperationDraftItemService],
  exports: [OperationDraftItemService],
})
export class OperationDraftItemModule {}
