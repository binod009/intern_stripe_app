export interface stripePaymentAttribute {
  id?: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  customerId: string;
  paymentMethod: string;
  receiptUrl: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface stripePaymentCreationAttributes
  extends Omit<stripePaymentAttribute, "id" | "createdAt" | "updatedAt"> {}
