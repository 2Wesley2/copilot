import type { AsyncResult } from '../../../error/index.js';
import type { OperationDraftItem } from './operation-draft-item.entity.js';

export const OPERATION_DRAFT_ITEM_REPOSITORY = Symbol('OPERATION_DRAFT_ITEM_REPOSITORY');

export interface OperationDraftItemRepository {
  findById(itemId: string): AsyncResult<OperationDraftItem | null, Error>;
  save(item: OperationDraftItem): AsyncResult<void, Error>;
}
