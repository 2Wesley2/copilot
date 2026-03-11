import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { DraftDecision } from './draft-decision.entity.js';
import {
  DRAFT_DECISION_REPOSITORY,
  type DraftDecisionRepository,
} from './draft-decision.repository.js';

@Injectable()
export class DraftDecisionService {
  constructor(
    @Inject(DRAFT_DECISION_REPOSITORY)
    private readonly repository: DraftDecisionRepository,
  ) {}

  health(): { ok: true } {
    return { ok: true };
  }

  findById(decisionId: string): AsyncResult<DraftDecision | null, Error> {
    return this.repository.findById(decisionId);
  }

  save(decision: DraftDecision): AsyncResult<void, Error> {
    return this.repository.save(decision);
  }
}
