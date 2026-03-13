export type OperationDraftItemAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export interface OperationDraftItemProps {
  readonly id: string;
  readonly action: OperationDraftItemAction;
  readonly draftId: string;
  readonly payload: unknown;
  readonly position: number;
  readonly productId?: string;
  readonly createdAt: Date;
}

export class OperationDraftItem {
  public constructor(private readonly props: OperationDraftItemProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get action(): OperationDraftItemAction {
    return this.props.action;
  }

  public get draftId(): string {
    return this.props.draftId;
  }

  public get payload(): unknown {
    return this.props.payload;
  }

  public get position(): number {
    return this.props.position;
  }

  public get productId(): string | undefined {
    return this.props.productId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}

export const createOperationDraftItem = (props: OperationDraftItemProps) =>
  new OperationDraftItem(props);
