import express, { NextFunction, Request, Response } from "express";

import router from "./routes/index";
import GlobalErrorHandler from "./controllers/error.controller";

const app = express();
app.use(express.json());

app.use("/me", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    msg: "success",
  });
});
app.use(router);

app.use(GlobalErrorHandler);

export default app;
