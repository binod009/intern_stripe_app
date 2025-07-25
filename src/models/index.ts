
import sequelize from "../config/database";
import stripeUserModel from "./stripe_customer.model";
import StripeInvoiceModel from "./stripe_invoice.model";
import stripePaymentModel from "./stripe_payment.model";
import stripeSubscriptionModel from "./stripe_subscription.model";

// initialize models here
const StripeUser = stripeUserModel(sequelize);
const StripePayment = stripePaymentModel(sequelize);
const StripeSubscription = stripeSubscriptionModel(sequelize);
const StripeInvoice = StripeInvoiceModel(sequelize);
// defined associations
StripeUser.hasMany(StripePayment, {
  foreignKey: "id",
  sourceKey: "id",
  as: "payments",
});

StripePayment.belongsTo(StripeUser, {
  foreignKey: "id",
  targetKey: "id",
  as: "userDetails",
});

StripeUser.hasMany(StripeSubscription, {
  foreignKey: "id",
  as: "subscriber_details",
});

StripeSubscription.belongsTo(StripeUser, {
  foreignKey: "id",
  as:"subscriber_details"
  
})

export { sequelize, StripeUser, StripePayment ,StripeSubscription,StripeInvoice};
