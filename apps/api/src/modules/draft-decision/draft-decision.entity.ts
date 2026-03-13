export interface DraftDecisionProps {
  readonly id: string;
  readonly actorId: string;
  readonly approved: boolean;
  readonly draftId: string;
  readonly reason?: unknown;
  readonly createdAt: Date;
}

export class DraftDecision {
  public constructor(private readonly props: DraftDecisionProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get actorId(): string {
    return this.props.actorId;
  }

  public get approved(): boolean {
    return this.props.approved;
  }

  public get draftId(): string {
    return this.props.draftId;
  }

  public get reason(): unknown {
    return this.props.reason;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}

export const createDraftDecision = (props: DraftDecisionProps) => new DraftDecision(props);
