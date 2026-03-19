import type { AsyncResult } from '../../../error/index.js';
import type { AuditEvent } from './audit-event.entity.js';

export const AUDIT_EVENT_REPOSITORY = Symbol('AUDIT_EVENT_REPOSITORY');

export interface AuditEventRepository {
  findById(auditEventId: string): AsyncResult<AuditEvent | null, Error>;
  save(event: AuditEvent): AsyncResult<void, Error>;
}
