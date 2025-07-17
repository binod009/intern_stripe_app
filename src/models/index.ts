import { Sequelize } from "sequelize";
import stripeUserModel from "./stripe_customer.model";

const database_connection_url = null;
const sequelize = new Sequelize("postgres", "postgres", "binod@666", {
  logging: false,
  dialect: "postgres",
});

// initialize models here
const StripeUser = stripeUserModel(sequelize);

export { sequelize, StripeUser };
