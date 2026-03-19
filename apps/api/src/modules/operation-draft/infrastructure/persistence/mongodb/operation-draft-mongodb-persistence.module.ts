import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OPERATION_DRAFT_REPOSITORY } from '../../../domain/operation-draft.repository.js';
import { OPERATION_DRAFT_MODEL_NAME, OperationDraftSchema } from './operation-draft.schema.js';
import { OperationDraftMapper } from './operation-draft.mapper.js';
import { OperationDraftMongooseRepository } from './operation-draft-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: OPERATION_DRAFT_MODEL_NAME, schema: OperationDraftSchema }])],
  providers: [
    OperationDraftMapper,
    OperationDraftMongooseRepository,
    {
      provide: OPERATION_DRAFT_REPOSITORY,
      useExisting: OperationDraftMongooseRepository,
    },
  ],
  exports: [OPERATION_DRAFT_REPOSITORY],
})
export class OperationDraftMongoPersistenceModule {}
