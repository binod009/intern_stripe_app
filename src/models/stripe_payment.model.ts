import sequelize, { DataTypes, Model } from "sequelize";
import { Sequelize } from "sequelize";
import {
  stripePaymentAttribute,
  stripePaymentCreationAttributes,
} from "../interfaces/models/stripe_payment.interface";
import { DATE } from "sequelize";
import { before } from "node:test";
import { stripePaymentController } from "../controllers/stripe.controller";
import { StripeUser } from ".";

const stripePaymentModel = (sequelize: Sequelize) => {
  class StripePayment extends Model<
    stripePaymentAttribute,
    stripePaymentCreationAttributes
  > {
    public id?: string;
    public stripePaymentIntentId!: string;
    public currency!: string;
    public status!: string;
    public amount!: number;
    public userId!: string;
    public customerId!: string;
    public paymentMethod!: string;
    public receiptUrl!: string;
    public description!: string;
    public createdAt?: Date;
    public updatedAt?: Date;
  }
  StripePayment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "stripeusers",
          key: "userId",
        },
      },
      customerId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
      },
      receiptUrl: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      currency: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "createdAt",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "updatedAt",
      },
    },

    {
      sequelize,
      modelName: "stripe_payment_history",
      tableName: "stripe_payment_history",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      timestamps: true,
      hooks: {
        beforeCreate: (stripe_payment) => {
          stripe_payment.createdAt = new Date();
          stripe_payment.updatedAt = new Date();
        },
        beforeUpdate: (stripe_payment) => {
          stripe_payment.updatedAt = new Date();
        },
      },
    }
  );

  return StripePayment;
};

export default stripePaymentModel;
