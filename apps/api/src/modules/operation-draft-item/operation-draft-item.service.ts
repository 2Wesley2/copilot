import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { OperationDraftItem } from './operation-draft-item.entity.js';
import {
  OPERATION_DRAFT_ITEM_REPOSITORY,
  type OperationDraftItemRepository,
} from './operation-draft-item.repository.js';

@Injectable()
export class OperationDraftItemService {
  constructor(
    @Inject(OPERATION_DRAFT_ITEM_REPOSITORY)
    private readonly repository: OperationDraftItemRepository,
  ) {}

  health(): { ok: true } {
    return { ok: true };
  }

  findById(itemId: string): AsyncResult<OperationDraftItem | null, Error> {
    return this.repository.findById(itemId);
  }

  save(item: OperationDraftItem): AsyncResult<void, Error> {
    return this.repository.save(item);
  }
}
