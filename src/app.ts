import express, { NextFunction, Request, Response } from "express";

import router from "./routes/index";
import GlobalErrorHandler from "./controllers/error.controller";
import sequelize from "./config/database";

const app = express();
app.use(express.json());

app.use("/me", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    msg: "success",
  });
});
app.use(router);

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
