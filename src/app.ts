import express, { NextFunction, Request, Response } from "express";

import router from "./routes/index";
import GlobalErrorHandler from "./controllers/error.controller";
import sequelize from "./config/database";
import bodyParser from "body-parser";
import { handleStripeWebhook } from "./controllers/stripe.controller";

const app = express();

app.use(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(express.json());
app.use("/me", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    msg: "success",
  });
});

app.use(router);

// syncing database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("database synced");
  } catch (error) {
    console.error("error syncing database file", error);
  }
})();

app.use(GlobalErrorHandler);

export default app;
