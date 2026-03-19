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
  public constructor(private readonly props: ProductProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  public get description(): unknown {
    return this.props.description;
  }

  public get isCurrent(): boolean | undefined {
    return this.props.isCurrent;
  }

  public get lineageKey(): string | undefined {
    return this.props.lineageKey;
  }

  public get name(): string {
    return this.props.name;
  }

  public get previousVersionId(): string | undefined {
    return this.props.previousVersionId;
  }

  public get priceCents(): number | undefined {
    return this.props.priceCents;
  }

  public get sku(): string {
    return this.props.sku;
  }

  public get stock(): number | undefined {
    return this.props.stock;
  }

  public get version(): number | undefined {
    return this.props.version;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

export const createProduct = (props: ProductProps) => new Product(props);
