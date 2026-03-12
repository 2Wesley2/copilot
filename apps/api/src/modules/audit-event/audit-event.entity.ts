import { isNullish } from '@copilot/shared';

export interface AuditEventProps {
  readonly id: string;
  readonly actorId?: string;
  readonly draftId?: string;
  readonly entityId?: string;
  readonly entityType?: string;
  readonly kind: string;
  readonly operationExecutionId?: string;
  readonly payload?: unknown;
  readonly sessionId?: string;
  readonly createdAt: Date;
}

export class AuditEvent {
  constructor(private readonly props: AuditEventProps) {}

  get id(): string {
    return this.props.id;
  }

  get actorId(): string | undefined {
    return this.props.actorId;
  }

  get draftId(): string | undefined {
    return this.props.draftId;
  }

  get entityId(): string | undefined {
    return this.props.entityId;
  }

  get entityType(): string | undefined {
    return this.props.entityType;
  }

  get kind(): string {
    return this.props.kind;
  }

  get operationExecutionId(): string | undefined {
    return this.props.operationExecutionId;
  }

  get payload(): unknown {
    return this.props.payload;
  }

  get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): AuditEventProps {
    return {
      id: this.props.id,
      ...(isNullish(this.props.actorId) ? {} : { actorId: this.props.actorId }),
      ...(isNullish(this.props.draftId) ? {} : { draftId: this.props.draftId }),
      ...(isNullish(this.props.entityId) ? {} : { entityId: this.props.entityId }),
      ...(isNullish(this.props.entityType) ? {} : { entityType: this.props.entityType }),
      kind: this.props.kind,
      ...(isNullish(this.props.operationExecutionId)
        ? {}
        : { operationExecutionId: this.props.operationExecutionId }),
      ...(isNullish(this.props.payload) ? {} : { payload: this.props.payload }),
      ...(isNullish(this.props.sessionId) ? {} : { sessionId: this.props.sessionId }),
      createdAt: this.props.createdAt,
    };
  }
}

export const createAuditEvent = (props: AuditEventProps): AuditEvent => new AuditEvent(props);
