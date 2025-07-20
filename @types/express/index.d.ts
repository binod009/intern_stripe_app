// @types/express/index.d.ts

import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        stripeCustomerId: string;
      };
    }
  }
}
