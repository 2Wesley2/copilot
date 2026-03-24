export const CONVERSATION_SESSION_STATUSES = ['ACTIVE', 'CLOSED', 'ABANDONED'] as const;

export type ConversationSessionStatus = (typeof CONVERSATION_SESSION_STATUSES)[number];

export interface ConversationSessionProps {
  readonly id: string;
  readonly actorId: string;
  readonly metadata?: unknown;
  readonly createdAt: Date;
  readonly endedAt?: Date | null;
  readonly status: ConversationSessionStatus;
  readonly updatedAt: Date;
}

export class ConversationSession {
  public constructor(private readonly props: ConversationSessionProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get actorId(): string {
    return this.props.actorId;
  }

  public get metadata(): unknown {
    return this.props.metadata;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get endedAt(): Date | null | undefined {
    return this.props.endedAt;
  }

  public get status(): ConversationSessionStatus {
    return this.props.status;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

export const createConversationSession = (props: ConversationSessionProps) =>
  new ConversationSession(props);
