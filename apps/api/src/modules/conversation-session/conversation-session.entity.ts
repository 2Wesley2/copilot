import { isNullish } from '@copilot/shared';

export interface ConversationSessionProps {
  readonly id: string;
  readonly actorId: string;
  readonly metadata?: unknown;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class ConversationSession {
  constructor(private readonly props: ConversationSessionProps) {}

  get id(): string {
    return this.props.id;
  }

  get actorId(): string {
    return this.props.actorId;
  }

  get metadata(): unknown {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): ConversationSessionProps {
    return {
      id: this.props.id,
      actorId: this.props.actorId,
      ...(isNullish(this.props.metadata) ? {} : { metadata: this.props.metadata }),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}

export const createConversationSession = (props: ConversationSessionProps) =>
  new ConversationSession(props);
