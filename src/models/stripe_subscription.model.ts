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
    public stripeSubscriptionId!: string;
    public status!: string;
    public currentPeriodStart!: Date;
    public cancelAtPeriodEnd!: boolean;
    public currentPeriodEnd!: Date;
    public planId?: string;
    public is_archived?:boolean;
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
          model: "stripeusers",
          key: "id",
        },
      },
      stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currentPeriodStart: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      currentPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      cancelAtPeriodEnd: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      planId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
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
