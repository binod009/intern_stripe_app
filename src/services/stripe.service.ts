import { StripeSubscription } from "../models";

interface ISubscriptionData {
  userId: number;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
}

class StripeServices {
  async saveSubscriptionToDatabase(subscription_data: ISubscriptionData) {
    const result = await StripeSubscription.create(subscription_data);
    console.log("from database result", result);
    return result;
  }
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
}

export default new StripeServices();
