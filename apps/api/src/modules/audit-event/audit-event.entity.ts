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
  public constructor(private readonly props: AuditEventProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get actorId(): string | undefined {
    return this.props.actorId;
  }

  public get draftId(): string | undefined {
    return this.props.draftId;
  }

  public get entityId(): string | undefined {
    return this.props.entityId;
  }

  public get entityType(): string | undefined {
    return this.props.entityType;
  }

  public get kind(): string {
    return this.props.kind;
  }

  public get operationExecutionId(): string | undefined {
    return this.props.operationExecutionId;
  }

  public get payload(): unknown {
    return this.props.payload;
  }

  public get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}

export const createAuditEvent = (props: AuditEventProps): AuditEvent => new AuditEvent(props);
