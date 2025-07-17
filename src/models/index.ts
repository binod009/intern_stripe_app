import sequelize from "../config/database";
import stripeUserModel from "./stripe_customer.model";

// initialize models here
const StripeUser = stripeUserModel(sequelize);

export { sequelize, StripeUser };
