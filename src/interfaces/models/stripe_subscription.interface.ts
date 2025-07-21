export interface stripeSubscriptionAttributes {
  id: number;
  userId: number;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
  is_archived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface stripeSubscriptionCreationAttributes
  extends Omit<
    stripeSubscriptionAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}
