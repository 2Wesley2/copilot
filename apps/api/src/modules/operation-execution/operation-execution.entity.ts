import { isNullish } from '@copilot/shared';

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
  constructor(private readonly props: OperationExecutionProps) {}

  get id(): string {
    return this.props.id;
  }

  get draftId(): string {
    return this.props.draftId;
  }

  get errorMessage(): unknown {
    return this.props.errorMessage;
  }

  get finishedAt(): unknown {
    return this.props.finishedAt;
  }

  get result(): unknown {
    return this.props.result;
  }

  get startedAt(): unknown {
    return this.props.startedAt;
  }

  get status(): OperationExecutionStatus {
    return this.props.status;
  }

  toPrimitives(): OperationExecutionProps {
    return {
      id: this.props.id,
      draftId: this.props.draftId,
      ...(isNullish(this.props.errorMessage) ? {} : { errorMessage: this.props.errorMessage }),
      ...(isNullish(this.props.finishedAt) ? {} : { finishedAt: this.props.finishedAt }),
      ...(isNullish(this.props.result) ? {} : { result: this.props.result }),
      ...(isNullish(this.props.startedAt) ? {} : { startedAt: this.props.startedAt }),
      status: this.props.status,
    };
  }
}

export const createOperationExecution = (props: OperationExecutionProps) =>
  new OperationExecution(props);
