import sequelize from "sequelize";
import { Model, DataTypes, Sequelize } from "sequelize";
import {
  StripeUserAttributes,
  StripeUserCreationAttributes,
} from "../interfaces/models/stripe_user.interface";

const stripeUserModel = (sequelize: Sequelize) => {
  class StripeUser
    extends Model<StripeUserAttributes, StripeUserCreationAttributes>
    implements StripeUserAttributes
  {
    public id!: number;
    public name!: string;
    public email!: string;
    public userId!: string;
    public phone!: string;
    public is_archived?: boolean;
    public createdAt?: Date | undefined;
    public updatedAt?: Date | undefined;
  }

  StripeUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: { type: DataTypes.STRING, allowNull: false },
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: "stripeusers",
      tableName: "stripeusers",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      timestamps: true,
      hooks: {
        beforeCreate: (stripeuser) => {
          stripeuser.createdAt = new Date();
          stripeuser.updatedAt = new Date();
        },
        beforeUpdate: (stripeuser) => {
          stripeuser.updatedAt = new Date();
        },
      },
    }
  );

  return StripeUser;
};

export default stripeUserModel;
