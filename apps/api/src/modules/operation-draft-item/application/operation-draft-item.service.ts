import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../../error/index.js';
import type { OperationDraftItem } from '../domain/operation-draft-item.entity.js';
import {
  OPERATION_DRAFT_ITEM_REPOSITORY,
  type OperationDraftItemRepository,
} from '../domain/operation-draft-item.repository.js';

@Injectable()
export class OperationDraftItemService {
  public constructor(
    @Inject(OPERATION_DRAFT_ITEM_REPOSITORY)
    private readonly repository: OperationDraftItemRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }

  public findById(itemId: string): AsyncResult<OperationDraftItem | null, Error> {
    return this.repository.findById(itemId);
  }

  public save(item: OperationDraftItem): AsyncResult<void, Error> {
    return this.repository.save(item);
  }
}
