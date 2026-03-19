import type { AsyncResult } from '../../../error/index.js';
import type { DraftDecision } from './draft-decision.entity.js';

export const DRAFT_DECISION_REPOSITORY = Symbol('DRAFT_DECISION_REPOSITORY');

export interface DraftDecisionRepository {
  findById(decisionId: string): AsyncResult<DraftDecision | null, Error>;
  save(decision: DraftDecision): AsyncResult<void, Error>;
}
