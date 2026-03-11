import { Inject, Injectable } from '@nestjs/common';

import type { AuditEventRepository } from './audit-event.repository.js';
import { AUDIT_EVENT_REPOSITORY } from './audit-event.repository.js';

@Injectable()
export class AuditEventService {
  constructor(
    @Inject(AUDIT_EVENT_REPOSITORY)
    private readonly repo: AuditEventRepository,
  ) {}
}
