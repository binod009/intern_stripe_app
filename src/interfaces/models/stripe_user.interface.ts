export interface StripeUserAttributes {
  id?: number;
  email: string;
  name: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  is_archived?: boolean;
}

export interface StripeUserCreationAttributes
  extends Omit<StripeUserAttributes, "id" | "createdAt" | "updatedAt"> {}
