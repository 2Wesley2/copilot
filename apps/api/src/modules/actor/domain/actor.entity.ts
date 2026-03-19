export interface ActorProps {
  readonly id: string;
  readonly externalId?: string;
  readonly name?: string;
  readonly email?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Actor {
  public constructor(private readonly props: ActorProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get externalId(): string | undefined {
    return this.props.externalId;
  }

  public get name(): string | undefined {
    return this.props.name;
  }

  public get email(): string | undefined {
    return this.props.email;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

export const createActor = (props: ActorProps): Actor => new Actor(props);
