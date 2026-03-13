import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import { type AuditEvent, createAuditEvent } from '../../../audit-event.entity.js';

export interface MongooseAuditEventPersistence {
  readonly _id: Types.ObjectId;
  readonly createdAt: Date;
  readonly actorId?: Types.ObjectId;
  readonly draftId?: Types.ObjectId;
  readonly entityId?: string;
  readonly entityType?: string;
  readonly kind: string;
  readonly operationExecutionId?: Types.ObjectId;
  readonly payload?: unknown;
  readonly sessionId?: Types.ObjectId;
}

export type MongooseAuditEventDocument = HydratedDocument<MongooseAuditEventPersistence>;

export class MongooseAuditEventMapper {
  public toDomain(document: MongooseAuditEventDocument): AuditEvent {
    return createAuditEvent({
      id: document._id.toHexString(),
      ...(isNullish(document.actorId) ? {} : { actorId: document.actorId.toHexString() }),
      ...(isNullish(document.draftId) ? {} : { draftId: document.draftId.toHexString() }),
      ...(isNullish(document.entityId) ? {} : { entityId: document.entityId }),
      ...(isNullish(document.entityType) ? {} : { entityType: document.entityType }),
      kind: document.kind,
      ...(isNullish(document.operationExecutionId)
        ? {}
        : { operationExecutionId: document.operationExecutionId.toHexString() }),
      ...(isNullish(document.payload) ? {} : { payload: document.payload }),
      ...(isNullish(document.sessionId) ? {} : { sessionId: document.sessionId.toHexString() }),
      createdAt: document.createdAt,
    });
  }

  public toPersistence(event: AuditEvent): MongooseAuditEventPersistence {
    return {
      _id: new Types.ObjectId(event.id),
      ...(isNullish(event.actorId) ? {} : { actorId: new Types.ObjectId(event.actorId) }),
      ...(isNullish(event.draftId) ? {} : { draftId: new Types.ObjectId(event.draftId) }),
      ...(isNullish(event.entityId) ? {} : { entityId: event.entityId }),
      ...(isNullish(event.entityType) ? {} : { entityType: event.entityType }),
      kind: event.kind,
      ...(isNullish(event.operationExecutionId)
        ? {}
        : { operationExecutionId: new Types.ObjectId(event.operationExecutionId) }),
      ...(isNullish(event.payload) ? {} : { payload: event.payload }),
      ...(isNullish(event.sessionId) ? {} : { sessionId: new Types.ObjectId(event.sessionId) }),
      createdAt: event.createdAt,
    };
  }
}
