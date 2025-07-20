export interface stripeSubscriptionAttributes {
  id: number;
  userId: number;
  stripeSubscriptionId: number;
  status: string;
  currentPeriodEnd: Date;
  planId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface stripeSubscriptionCreationAttributes
  extends Omit<
    stripeSubscriptionAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}
