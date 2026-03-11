import type { AsyncResult } from '../../error/index.js';
import type { OperationDraft } from './operation-draft.entity.js';

export const OPERATION_DRAFT_REPOSITORY = Symbol('OPERATION_DRAFT_REPOSITORY');

export interface OperationDraftRepository {
  findById(draftId: string): AsyncResult<OperationDraft | null, Error>;
  save(draft: OperationDraft): AsyncResult<void, Error>;
}
