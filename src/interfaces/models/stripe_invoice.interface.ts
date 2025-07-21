export interface StripeInvoiceAttributes {
  id?: number;
  stripeInvoiceId: string;
  userId: number;
  amountDue: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StripeInvoiceCreationAttributes extends Omit<StripeInvoiceAttributes, 'id'|'createdAt'|'updatedAt'> { }