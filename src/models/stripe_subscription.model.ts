import { DataTypes, DATE, Model, Sequelize } from "sequelize";
import {
  stripeSubscriptionAttributes,
  stripeSubscriptionCreationAttributes,
} from "../interfaces/models/stripe_subscription.interface";

const stripeSubscriptionModel = (sequelize: Sequelize) => {
  class stripeSubscription extends Model<
    stripeSubscriptionAttributes,
    stripeSubscriptionCreationAttributes
  > {
    public id!: number;
    public userId!: number;
    public stripeSubscriptionId!: number;
    public status!: string;
    public currentPeriodEnd!: Date;
    public planId?: number;
    public createdAt?: Date;
    public updatedAt?: Date;
  }

  stripeSubscription.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "stripeuser",
          key: "id",
        },
      },
      stripeSubscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currentPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: "stripe_subscription",
      tableName: "stripe_subscription",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate: (stripe_subscription) => {
          stripe_subscription.createdAt = new Date();
          stripe_subscription.updatedAt = new Date();
        },
        beforeUpdate: (stripe_subscription) => {
          stripe_subscription.updatedAt = new Date();
        },
      },
    }
  );
  return stripeSubscription;
};

export default stripeSubscriptionModel;
