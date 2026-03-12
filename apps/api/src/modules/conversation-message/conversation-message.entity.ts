import { isNullish } from '@copilot/shared';

export type ConversationMessageRole = 'SYSTEM' | 'USER' | 'ASSISTANT';

export interface ConversationMessageProps {
  readonly id: string;
  readonly actorId?: string;
  readonly content: string;
  readonly role: ConversationMessageRole;
  readonly sessionId: string;
  readonly streamed?: boolean;
  readonly createdAt: Date;
}

export class ConversationMessage {
  constructor(private readonly props: ConversationMessageProps) {}

  get id(): string {
    return this.props.id;
  }

  get actorId(): string | undefined {
    return this.props.actorId;
  }

  get content(): string {
    return this.props.content;
  }

  get role(): ConversationMessageRole {
    return this.props.role;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get streamed(): boolean | undefined {
    return this.props.streamed;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): ConversationMessageProps {
    return {
      id: this.props.id,
      ...(isNullish(this.props.actorId) ? {} : { actorId: this.props.actorId }),
      content: this.props.content,
      role: this.props.role,
      sessionId: this.props.sessionId,
      ...(isNullish(this.props.streamed) ? {} : { streamed: this.props.streamed }),
      createdAt: this.props.createdAt,
    };
  }
}

export const createConversationMessage = (props: ConversationMessageProps) =>
  new ConversationMessage(props);
