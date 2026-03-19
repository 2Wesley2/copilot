import { Inject, Injectable } from '@nestjs/common';

import type { AuditEventRepository } from '../domain/audit-event.repository.js';
import { AUDIT_EVENT_REPOSITORY } from '../domain/audit-event.repository.js';

@Injectable()
export class AuditEventService {
  public constructor(
    @Inject(AUDIT_EVENT_REPOSITORY)
    private readonly repo: AuditEventRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }
}
