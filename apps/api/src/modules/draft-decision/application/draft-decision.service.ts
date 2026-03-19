import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../../error/index.js';
import type { DraftDecision } from '../domain/draft-decision.entity.js';
import {
  DRAFT_DECISION_REPOSITORY,
  type DraftDecisionRepository,
} from '../domain/draft-decision.repository.js';

@Injectable()
export class DraftDecisionService {
  public constructor(
    @Inject(DRAFT_DECISION_REPOSITORY)
    private readonly repository: DraftDecisionRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }

  public findById(decisionId: string): AsyncResult<DraftDecision | null, Error> {
    return this.repository.findById(decisionId);
  }

  public save(decision: DraftDecision): AsyncResult<void, Error> {
    return this.repository.save(decision);
  }
}
