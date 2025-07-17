export interface StripeUserAttributes {
  id?: number;
  email: string;
  name: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
}

export interface StripeUserCreationAttributes extends Omit<StripeUserAttributes, 'id' | "createdAt" | "updatedAt"> { }