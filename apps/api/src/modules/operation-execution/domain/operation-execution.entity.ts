export type OperationExecutionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface OperationExecutionProps {
  readonly id: string;
  readonly draftId: string;
  readonly errorMessage?: unknown;
  readonly finishedAt?: unknown;
  readonly result?: unknown;
  readonly startedAt?: unknown;
  readonly status: OperationExecutionStatus;
}

export class OperationExecution {
  public constructor(private readonly props: OperationExecutionProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get draftId(): string {
    return this.props.draftId;
  }

  public get errorMessage(): unknown {
    return this.props.errorMessage;
  }

  public get finishedAt(): unknown {
    return this.props.finishedAt;
  }

  public get result(): unknown {
    return this.props.result;
  }

  public get startedAt(): unknown {
    return this.props.startedAt;
  }

  public get status(): OperationExecutionStatus {
    return this.props.status;
  }
}

export const createOperationExecution = (props: OperationExecutionProps) =>
  new OperationExecution(props);
