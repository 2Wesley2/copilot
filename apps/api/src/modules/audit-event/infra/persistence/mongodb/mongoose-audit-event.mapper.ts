import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import { AuditEvent } from '../../../audit-event.entity.js';

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
  toDomain(document: MongooseAuditEventDocument): AuditEvent {
    return new AuditEvent({
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

  toPersistence(event: AuditEvent): MongooseAuditEventPersistence {
    const primitives = event.toPrimitives();

    return {
      _id: new Types.ObjectId(primitives.id),
      ...(isNullish(primitives.actorId) ? {} : { actorId: new Types.ObjectId(primitives.actorId) }),
      ...(isNullish(primitives.draftId) ? {} : { draftId: new Types.ObjectId(primitives.draftId) }),
      ...(isNullish(primitives.entityId) ? {} : { entityId: primitives.entityId }),
      ...(isNullish(primitives.entityType) ? {} : { entityType: primitives.entityType }),
      kind: primitives.kind,
      ...(isNullish(primitives.operationExecutionId)
        ? {}
        : { operationExecutionId: new Types.ObjectId(primitives.operationExecutionId) }),
      ...(isNullish(primitives.payload) ? {} : { payload: primitives.payload }),
      ...(isNullish(primitives.sessionId)
        ? {}
        : { sessionId: new Types.ObjectId(primitives.sessionId) }),
      createdAt: primitives.createdAt,
    };
  }
}
