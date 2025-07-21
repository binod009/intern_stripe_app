import Stripe from "stripe";
import { StripeInvoice, StripeSubscription } from "../models";
import stripe from "../config/stripe";
import ApiError from "../utils/ApiError";

interface ISubscriptionData {
  userId: number;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
}
interface IStripeInvoice {
  stripeInvoiceId: string;
  userId: number;
  amountDue: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

class StripeServices {
  // this function saves the subscription details to database
  async saveSubscriptionToDatabase(subscription_data: ISubscriptionData) {
    const result = await StripeSubscription.create(subscription_data);
    console.log("from database result", result);
    return result;
  }
  // handle the subscription deletion
  async markSubscriptionDelete(subscriptionId: string) {
    const result = await StripeSubscription.update(
      { is_archived: true },
      {
        where: {
          stripeSubscriptionId: subscriptionId,
        },
      }
    );
    return result;
  }
  // this function saves the generate invoice to database
  async saveInvoiceToDatabase(invoiceData: Stripe.Invoice, userId: number) {
    if (!invoiceData.id || !invoiceData.status) {
      throw new ApiError("Missing required invoice fields (id or status)", 400);
    }

    const invoice_data = {
      stripeInvoiceId: invoiceData.id,
      userId: userId,
      amountDue: invoiceData.amount_due,
      currency: invoiceData.currency,
      status: invoiceData.status,
      hostedInvoiceUrl: invoiceData.hosted_invoice_url || undefined,
      invoicePdf: invoiceData.invoice_pdf || undefined,
      createdAt: new Date(invoiceData.created * 1000),
      updatedAt: new Date(invoiceData.created * 1000),
    };

    await StripeInvoice.create(invoice_data);
  }

  // function to generate invoice after payment is made
  async generateInvoiceService(stripeCustomerId: string) {
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: true, // finalize & send
    });
    await stripe.invoices.finalizeInvoice(invoice.id as string);
  }

  async getAllInvoice(userId: number) {
    return await StripeInvoice.findAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
    });
  }
}

export default new StripeServices();
