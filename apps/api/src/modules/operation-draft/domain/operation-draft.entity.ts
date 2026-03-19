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
  public constructor(private readonly props: OperationDraftProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get actorId(): string {
    return this.props.actorId;
  }

  public get intent(): string {
    return this.props.intent;
  }

  public get payload(): unknown {
    return this.props.payload;
  }

  public get sessionId(): string {
    return this.props.sessionId;
  }

  public get status(): OperationDraftStatus {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

export const createOperationDraft = (props: OperationDraftProps) => new OperationDraft(props);
