import sequelize from "../config/database";
import stripe from "../config/stripe";
import stripeUserModel from "./stripe_customer.model";
import stripePaymentModel from "./stripe_payment.model";

// initialize models here
const StripeUser = stripeUserModel(sequelize);
const StripePayment = stripePaymentModel(sequelize);

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

export { sequelize, StripeUser, StripePayment };
