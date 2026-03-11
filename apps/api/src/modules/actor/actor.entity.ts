export interface ActorProps {
  readonly id: string;
  readonly externalId?: string;
  readonly name?: string;
  readonly email?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Actor {
  constructor(private readonly props: ActorProps) {}

  get id(): string {
    return this.props.id;
  }

  get externalId(): string | undefined {
    return this.props.externalId;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): ActorProps {
    return {
      id: this.props.id,
      ...(this.props.externalId !== undefined ? { externalId: this.props.externalId } : {}),
      ...(this.props.name !== undefined ? { name: this.props.name } : {}),
      ...(this.props.email !== undefined ? { email: this.props.email } : {}),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
