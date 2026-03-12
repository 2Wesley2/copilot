import { isNullish } from '@copilot/shared';

export interface DraftDecisionProps {
  readonly id: string;
  readonly actorId: string;
  readonly approved: boolean;
  readonly draftId: string;
  readonly reason?: unknown;
  readonly createdAt: Date;
}

export class DraftDecision {
  constructor(private readonly props: DraftDecisionProps) {}

  get id(): string {
    return this.props.id;
  }

  get actorId(): string {
    return this.props.actorId;
  }

  get approved(): boolean {
    return this.props.approved;
  }

  get draftId(): string {
    return this.props.draftId;
  }

  get reason(): unknown {
    return this.props.reason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): DraftDecisionProps {
    return {
      id: this.props.id,
      actorId: this.props.actorId,
      approved: this.props.approved,
      draftId: this.props.draftId,
      ...(isNullish(this.props.reason) ? {} : { reason: this.props.reason }),
      createdAt: this.props.createdAt,
    };
  }
}

export const createDraftDecision = (props: DraftDecisionProps) => new DraftDecision(props);
