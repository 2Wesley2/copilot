import { isNullish } from '@copilot/shared';

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
      ...(isNullish(this.props.externalId) ? {} : { externalId: this.props.externalId }),
      ...(isNullish(this.props.name) ? {} : { name: this.props.name }),
      ...(isNullish(this.props.email) ? {} : { email: this.props.email }),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}

export const createActor = (props: ActorProps): Actor => {
  return new Actor(props);
};
