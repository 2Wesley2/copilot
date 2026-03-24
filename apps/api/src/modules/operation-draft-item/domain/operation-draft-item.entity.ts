export const OPERATION_DRAFT_ITEM_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;

export type OperationDraftItemAction = (typeof OPERATION_DRAFT_ITEM_ACTIONS)[number];

export const OPERATION_DRAFT_ITEM_VALIDATION_STATUSES = [
  'PENDING',
  'VALID',
  'INVALID',
  'REQUIRES_ATTENTION',
] as const;

export type OperationDraftItemValidationStatus =
  (typeof OPERATION_DRAFT_ITEM_VALIDATION_STATUSES)[number];

export interface OperationDraftItemProps {
  readonly id: string;
  readonly action: OperationDraftItemAction;
  readonly draftId: string;
  readonly payload: unknown;
  readonly position: number;
  readonly productId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly validationStatus: OperationDraftItemValidationStatus;
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

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get validationStatus(): OperationDraftItemValidationStatus {
    return this.props.validationStatus;
  }
}

export const createOperationDraftItem = (props: OperationDraftItemProps) =>
  new OperationDraftItem(props);
