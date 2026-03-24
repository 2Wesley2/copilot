export const OPERATION_EXECUTION_STATUSES = [
  'PENDING',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
] as const;
export type OperationExecutionStatus = (typeof OPERATION_EXECUTION_STATUSES)[number];
export interface OperationExecutionProps {
  readonly id: string;
  readonly attempt: number;
  readonly decisionId: string;
  readonly draftId: string;
  readonly errorMessage?: string;
  readonly executedAt?: Date | null;
  readonly executedById?: string | null;
  readonly executedPayload?: unknown;
  readonly finishedAt?: Date | null;
  readonly isFinal: boolean;
  readonly result?: unknown;
  readonly startedAt?: Date | null;
  readonly status: OperationExecutionStatus;
}
export class OperationExecution {
  public constructor(private readonly props: OperationExecutionProps) {}
  public get id(): string {
    return this.props.id;
  }
  public get attempt(): number {
    return this.props.attempt;
  }
  public get decisionId(): string {
    return this.props.decisionId;
  }
  public get draftId(): string {
    return this.props.draftId;
  }
  public get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }
  public get executedAt(): Date | null | undefined {
    return this.props.executedAt;
  }
  public get executedById(): string | null | undefined {
    return this.props.executedById;
  }
  public get executedPayload(): unknown {
    return this.props.executedPayload;
  }
  public get finishedAt(): Date | null | undefined {
    return this.props.finishedAt;
  }
  public get isFinal(): boolean {
    return this.props.isFinal;
  }
  public get result(): unknown {
    return this.props.result;
  }
  public get startedAt(): Date | null | undefined {
    return this.props.startedAt;
  }
  public get status(): OperationExecutionStatus {
    return this.props.status;
  }
}
export const createOperationExecution = (props: OperationExecutionProps) =>
  new OperationExecution(props);
