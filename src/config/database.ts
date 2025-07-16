import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAMER || "stripe_app_dev",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "binod@666",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
