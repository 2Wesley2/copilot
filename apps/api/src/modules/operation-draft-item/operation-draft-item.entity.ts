import { isNullish } from '@copilot/shared';

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
  constructor(private readonly props: OperationDraftItemProps) {}

  get id(): string {
    return this.props.id;
  }

  get action(): OperationDraftItemAction {
    return this.props.action;
  }

  get draftId(): string {
    return this.props.draftId;
  }

  get payload(): unknown {
    return this.props.payload;
  }

  get position(): number {
    return this.props.position;
  }

  get productId(): string | undefined {
    return this.props.productId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): OperationDraftItemProps {
    return {
      id: this.props.id,
      action: this.props.action,
      draftId: this.props.draftId,
      payload: this.props.payload,
      position: this.props.position,
      ...(isNullish(this.props.productId) ? {} : { productId: this.props.productId }),
      createdAt: this.props.createdAt,
    };
  }
}
