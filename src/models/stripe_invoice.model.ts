import { DataTypes, Model, Sequelize } from "sequelize";
import {
  StripeInvoiceAttributes,
  StripeInvoiceCreationAttributes,
} from "../interfaces/models/stripe_invoice.interface";
import sequelize from "../config/database";

const StripeInvoiceModel = (sequelize: Sequelize) => {
  class StripeInvoice
    extends Model<StripeInvoiceAttributes, StripeInvoiceCreationAttributes>
    implements StripeInvoiceAttributes
  {
    public id!: number;
    public stripeInvoiceId!: string;
    public userId!: number;
    public amountDue!: number;
    public currency!: string;
    public status!: string;
    public hostedInvoiceUrl!: string;
    public invoicePdf!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
  }
  StripeInvoice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stripeInvoiceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      amountDue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hostedInvoiceUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invoicePdf: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "stripe_invoices",
      modelName: "StripeInvoice",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      timestamps: true,
      hooks: {
        beforeCreate: (stripe_invoice) => {
          stripe_invoice.createdAt = new Date();
          stripe_invoice.updatedAt = new Date();
        },
        beforeUpdate: (stripe_invoice) => {
          stripe_invoice.updatedAt = new Date();
        },
      },
    }
  );
  return StripeInvoice;
};

export default StripeInvoiceModel;
