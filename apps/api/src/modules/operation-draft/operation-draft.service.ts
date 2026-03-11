import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { OperationDraft } from './operation-draft.entity.js';
import {
  OPERATION_DRAFT_REPOSITORY,
  type OperationDraftRepository,
} from './operation-draft.repository.js';

@Injectable()
export class OperationDraftService {
  constructor(
    @Inject(OPERATION_DRAFT_REPOSITORY)
    private readonly repository: OperationDraftRepository,
  ) {}

  health(): { ok: true } {
    return { ok: true };
  }

  findById(draftId: string): AsyncResult<OperationDraft | null, Error> {
    return this.repository.findById(draftId);
  }

  save(draft: OperationDraft): AsyncResult<void, Error> {
    return this.repository.save(draft);
  }
}
