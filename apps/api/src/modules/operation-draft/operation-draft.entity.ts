export type OperationDraftStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface OperationDraftProps {
  readonly id: string;
  readonly actorId: string;
  readonly intent: string;
  readonly payload: unknown;
  readonly sessionId: string;
  readonly status: OperationDraftStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class OperationDraft {
  constructor(private readonly props: OperationDraftProps) {}

  get id(): string {
    return this.props.id;
  }

  get actorId(): string {
    return this.props.actorId;
  }

  get intent(): string {
    return this.props.intent;
  }

  get payload(): unknown {
    return this.props.payload;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get status(): OperationDraftStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): OperationDraftProps {
    return {
      id: this.props.id,
      actorId: this.props.actorId,
      intent: this.props.intent,
      payload: this.props.payload,
      sessionId: this.props.sessionId,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}

export const createOperationDraft = (props: OperationDraftProps) => new OperationDraft(props);
