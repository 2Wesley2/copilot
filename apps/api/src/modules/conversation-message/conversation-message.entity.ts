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
  public constructor(private readonly props: ConversationMessageProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get actorId(): string | undefined {
    return this.props.actorId;
  }

  public get content(): string {
    return this.props.content;
  }

  public get role(): ConversationMessageRole {
    return this.props.role;
  }

  public get sessionId(): string {
    return this.props.sessionId;
  }

  public get streamed(): boolean | undefined {
    return this.props.streamed;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}

export const createConversationMessage = (props: ConversationMessageProps) =>
  new ConversationMessage(props);
