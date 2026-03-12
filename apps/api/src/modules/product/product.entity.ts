import { isNullish } from '@copilot/shared';

export interface ProductProps {
  readonly id: string;
  readonly deletedAt?: Date;
  readonly description?: unknown;
  readonly isCurrent?: boolean;
  readonly lineageKey?: string;
  readonly name: string;
  readonly previousVersionId?: string;
  readonly priceCents?: number;
  readonly sku: string;
  readonly stock?: number;
  readonly version?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Product {
  constructor(private readonly props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  get description(): unknown {
    return this.props.description;
  }

  get isCurrent(): boolean | undefined {
    return this.props.isCurrent;
  }

  get lineageKey(): string | undefined {
    return this.props.lineageKey;
  }

  get name(): string {
    return this.props.name;
  }

  get previousVersionId(): string | undefined {
    return this.props.previousVersionId;
  }

  get priceCents(): number | undefined {
    return this.props.priceCents;
  }

  get sku(): string {
    return this.props.sku;
  }

  get stock(): number | undefined {
    return this.props.stock;
  }

  get version(): number | undefined {
    return this.props.version;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): ProductProps {
    return {
      id: this.props.id,
      ...(isNullish(this.props.deletedAt) ? {} : { deletedAt: this.props.deletedAt }),
      ...(isNullish(this.props.description) ? {} : { description: this.props.description }),
      ...(isNullish(this.props.isCurrent) ? {} : { isCurrent: this.props.isCurrent }),
      ...(isNullish(this.props.lineageKey) ? {} : { lineageKey: this.props.lineageKey }),
      name: this.props.name,
      ...(isNullish(this.props.previousVersionId)
        ? {}
        : { previousVersionId: this.props.previousVersionId }),
      ...(isNullish(this.props.priceCents) ? {} : { priceCents: this.props.priceCents }),
      sku: this.props.sku,
      ...(isNullish(this.props.stock) ? {} : { stock: this.props.stock }),
      ...(isNullish(this.props.version) ? {} : { version: this.props.version }),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}

export const createProduct = (props: ProductProps) => new Product(props);
