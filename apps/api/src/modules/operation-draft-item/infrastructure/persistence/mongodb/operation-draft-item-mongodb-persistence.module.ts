import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OPERATION_DRAFT_ITEM_REPOSITORY } from '../../../domain/operation-draft-item.repository.js';
import { OPERATION_DRAFT_ITEM_MODEL_NAME, OperationDraftItemSchema } from './operation-draft-item.schema.js';
import { OperationDraftItemMapper } from './operation-draft-item.mapper.js';
import { OperationDraftItemMongooseRepository } from './operation-draft-item-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: OPERATION_DRAFT_ITEM_MODEL_NAME, schema: OperationDraftItemSchema }])],
  providers: [
    OperationDraftItemMapper,
    OperationDraftItemMongooseRepository,
    {
      provide: OPERATION_DRAFT_ITEM_REPOSITORY,
      useExisting: OperationDraftItemMongooseRepository,
    },
  ],
  exports: [OPERATION_DRAFT_ITEM_REPOSITORY],
})
export class OperationDraftItemMongoPersistenceModule {}
